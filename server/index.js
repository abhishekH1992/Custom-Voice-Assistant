const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
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

const app = express();

const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

const authenticate = async (token) => {
    console.log('Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    if (!token) return null;
    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        console.log('Decoded:', decoded);
        const user = await User.findByPk(decoded.userId);
        console.log('User:', user);
        return user;
    } catch (err) {
        console.error('Authentication error:', err);
        return null;
    }
};

async function startServer() {
    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            console.log('Context function called');
            const token = req.headers.authorization || '';
            const user = await authenticate(token);
            console.log('Context user:', user);
            return { user, redis };
        },
    });

    await server.start();

    // Configure CORS
    const corsOptions = {
        origin: process.env.REACT_APP_URL || 'http://localhost:3000',
        credentials: true
    };

    // Logging middleware
    app.use((req, res, next) => {
        console.log('Incoming request:', {
            method: req.method,
            path: req.path,
            headers: req.headers,
        });
        next();
    });

    app.use(cors(corsOptions));
    app.use(json());

    app.use(
        '/graphql',
        expressMiddleware(server, {
            context: async ({ req }) => {
                console.log('Express middleware context called');
                const token = req.headers.authorization || '';
                const user = await authenticate(token);
                console.log('Express middleware user:', user);
                return { user, redis };
            },
        })
    );

    const PORT = process.env.PORT || 5000;

    const httpServer = http.createServer(app);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
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