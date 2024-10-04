const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
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
        secure: true,
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

// Create Apollo Server
const server = new ApolloServer({
    schema,
});

// Start the server
async function startServer() {
    await server.start();

    app.use(
        '/graphql',
        cors({
            origin: process.env.CLIENT_URL || 'https://your-app-name.vercel.app',
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

    // Catch-all route to handle client-side routing
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });

    // Export the Express API
    module.exports = app;
}

startServer().catch(error => {
    console.error('Failed to start the server:', error);
});