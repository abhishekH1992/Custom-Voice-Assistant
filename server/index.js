const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { User } = require('./models');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');

const app = express();

// Create the schema
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

// Create Apollo Server
const server = new ApolloServer({
    schema,
});

// Start the server
async function startServer() {
    try {
        await server.start();

        const corsOptions = {
            origin: (origin, callback) => {
                const allowedOrigins = [
                    process.env.CLIENT_URL,
                    'http://localhost:3000',
                    'https://akoplus.vercel.app'
                ].filter(Boolean);

                if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: true,
        };

        app.use(
            '/graphql',
            cors(corsOptions),
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

        // Serve static files from the React app in production
        if (process.env.NODE_ENV === 'production') {
            app.use(express.static(path.join(__dirname, '../client/build')));

            // Handle all other routes by serving the React app
            app.get('*', (req, res) => {
                res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
            });
        }

        // Start the server
        const PORT = process.env.PORT || 5000;
        if (process.env.NODE_ENV !== 'production') {
            app.listen(PORT, () => {
                console.log(`Server is running on http://localhost:${PORT}`);
                console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
            });
        }

        return app;
    } catch (error) {
        console.error('Failed to start the server:', error);
        throw error;
    }
}

// For local development and Vercel
if (process.env.NODE_ENV !== 'production') {
    startServer();
} else {
    module.exports = startServer().catch(error => {
        console.error('Unhandled error during server startup:', error);
        process.exit(1);
    });
}