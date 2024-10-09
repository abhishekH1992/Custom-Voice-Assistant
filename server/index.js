require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const { User } = require('./models');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');
const { createTunnel } = require('./utils/sshTunnel');
const db = require('./models');

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
        // Establish SSH tunnel and database connection in production
        if (process.env.NODE_ENV === 'production') {
            const sshTunnel = await createTunnel();
            console.log('SSH Tunnel established');

            // Authenticate database connection
            await db.sequelize.authenticate();
            console.log('Database connection has been established successfully.');

            // Handle graceful shutdown
            process.on('SIGTERM', () => {
                console.log('SIGTERM signal received: closing HTTP server');
                sshTunnel.close(() => {
                    console.log('SSH Tunnel closed');
                    db.sequelize.close().then(() => {
                        console.log('Database connection closed');
                        process.exit(0);
                    });
                });
            });
        } else {
            // Development mode without SSH tunnel
            await db.sequelize.authenticate();
            console.log('Database connection has been established successfully.');
        }

        await server.start();

        app.use(
            '/graphql',
            cors({
                origin: process.env.CLIENT_URL || 'https://akoplus.vercel.app',
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

        // Serve static files from the React app
        app.use(express.static(path.join(__dirname, '../client/build')));

        // Handle all other routes by serving the React app
        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
        });

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        return app;
    } catch (error) {
        console.error('Failed to start the server:', error);
        throw error;
    }
}

// For both Vercel and local development
if (require.main === module) {
    startServer().catch(error => {
        console.error('Unhandled error during server startup:', error);
        process.exit(1);
    });
} else {
    module.exports = startServer;
}