const express = require('express');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const path = require('path');
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

const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

app.use(authMiddleware);

app.use(express.static(path.join(__dirname, '../client/build')));

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

async function startApolloServer() {
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({
        schema,
        context: async (ctx) => {
            const token = ctx.connectionParams?.authorization || '';
            const user = await authenticate(token);
            return { user };
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
    
    app.use(
        '/graphql',
        cors({
            origin: process.env.NODE_ENV === 'production' 
                ? 'https://convo.akoplus.co.nz' 
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

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });

    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at ${process.env.NODE_ENV === 'production' ? 'https://convo.akoplus.co.nz/graphql' : `http://localhost:${PORT}/graphql`}`);
    console.log(`🚀 Subscriptions ready at ${process.env.NODE_ENV === 'production' ? 'wss://convo.akoplus.co.nz/graphql' : `ws://localhost:${PORT}/graphql`}`);
}

startApolloServer();