const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const cors = require('cors');
const { json } = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');
const redis = require('./redis');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { PubSub } = require('graphql-subscriptions');

const app = express();
const pubsub = new PubSub();

const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

const authenticate = async (token) => {
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);
        return user;
    } catch (err) {
        console.error('Authentication error:', err);
        return null;
    }
};

async function startServer() {
    const httpServer = http.createServer(app);

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ 
        schema,
        context: async (ctx) => {
            if (ctx.connectionParams && ctx.connectionParams.authorization) {
                const user = await authenticate(ctx.connectionParams.authorization);
                return { user, redis, pubsub };
            }
            return { redis, pubsub };
        },
    }, wsServer);

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        },
                    };
                },
            },
        ],
    });

    await server.start();

    const corsOptions = {
        origin: process.env.REACT_APP_URL || 'http://localhost:3000',
        credentials: true
    };

    app.use(cors(corsOptions));
    app.use(json());

    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization || '';
                const user = await authenticate(token);
                return { user, redis, pubsub };
            },
        })
    );

    if (process.env.NODE_ENV === 'production') {
        // Serve static files from the React app
        app.use(express.static(path.resolve(__dirname, '../client/build')));
    
        // Handles any requests that don't match the ones above
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
        });
    }

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🚀 WebSocket server ready at ws://localhost:${PORT}/graphql`);
    });
}

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set!');
    process.exit(1);
}

startServer().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
});

module.exports = app;