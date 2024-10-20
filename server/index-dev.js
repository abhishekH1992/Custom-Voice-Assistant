const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { useServer } = require('graphql-ws/lib/use/ws');
const { WebSocketServer } = require('ws');
const { User } = require('./models');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');
const redis = require('./redis');

const app = express();

// Define schema
const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

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

// Create an Apollo Server
async function startServer() {
    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            const user = await authenticate(token);
            return { user, redis };
        },
    });

    await server.start();

    // Configure CORS
    const corsOptions = {
        origin: 'http://localhost:3000',
        credentials: true
    };

    app.use(cors(corsOptions));

    app.use(
        '/graphql',
        express.json(),
        expressMiddleware(server)
    );

    // Create HTTP and WebSocket server
    const httpServer = http.createServer(app);

    // Create WebSocket server
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    useServer(
        {
            schema,
            context: async (ctx, msg, args) => {
                const token = ctx.connectionParams?.authorization || '';
                const user = await authenticate(token);
                return { user, redis };
            }
        },
        wsServer
    );

    const PORT = process.env.PORT || 5000;

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql 🚀`);
        console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql 🚀`);
    });
}

startServer();
