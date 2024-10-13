const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const express = require('express');
const http = require('http');
const cors = require('cors');
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
    const server = new ApolloServer({
        schema,
        context: async ({ req }) => {
            const token = req.headers.authorization || '';
            const user = await authenticate(token);
            return { user, redis };
        },
    });

    await server.start();

    // Apply CORS middleware to all routes
    app.use(cors());

    app.use(
        '/api/graphql',
        express.json(),
        expressMiddleware(server)
    );

    // Serve static files from the React app
    app.use(express.static(path.join(__dirname, '../client/build')));

    // API routes should be defined before the "catchall" route
    // Add your other API routes here if any

    // The "catchall" handler: for any request that doesn't
    // match one above, send back React's index.html file.
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    const PORT = process.env.PORT || 5000;

    const httpServer = http.createServer(app);

    httpServer.listen(PORT, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}`);
        console.log(`🚀 GraphQL endpoint: http://localhost:${PORT}/graphql`);
    });
}

startServer();

module.exports = app;