const express = require('express');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const session = require('express-session');
const authMiddleware = require('./middleware/auth.js');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { User } = require('./models');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');

dotenv.config();

const app = express();
const httpServer = http.createServer(app);

const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === 'production';

// Create the schema
const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: isProduction,
        sameSite: 'strict'
    }
}));

app.use(authMiddleware);

// Authentication function
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

// Create and start Apollo Server
async function startApolloServer() {
    let serverCleanup = null;

    if (!isProduction) {
        // Set up WebSocket server for subscriptions in development
        const wsServer = new WebSocketServer({
            server: httpServer,
            path: '/graphql',
        });

        serverCleanup = useServer({
            schema,
            context: async (ctx) => {
                const token = ctx.connectionParams?.authorization || '';
                const user = await authenticate(token);
                return { user };
            },
        }, wsServer);
    }

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            if (serverCleanup) {
                                await serverCleanup.dispose();
                            }
                        },
                    };
                },
            },
        ],
    });

    await server.start();

    app.use(
        '/graphql',
        cors({
            origin: isProduction 
                ? 'https://akoplus.vercel.app' 
                : 'http://localhost:3000',
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => {
                const token = req.headers.authorization || '';
                const user = await authenticate(token);
                return { user };
            },
        })
    );

    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).send('OK');
    });

    if (isProduction) {
        // In production, export the Express API for serverless use
        module.exports = app;
    } else {
        // In development, start the server
        await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
    }
}

startApolloServer().catch(error => {
    console.error('Failed to start the server:', error);
});