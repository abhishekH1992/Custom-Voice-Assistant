const express = require('express');
const http = require('http');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const path = require('path');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');
const dotenv = require('dotenv');
const { pubsub } = require('./utils/pubsub.util');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
dotenv.config();

async function startApolloServer() {
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ 
        schema: mergedTypeDef,
        context: () => ({ pubsub })
    }, wsServer);

    const server = new ApolloServer({
        typeDefs: mergedTypeDef,
        resolvers: mergedResolver,
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
            origin: 'http://localhost:3000',
            credentials: true
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token, pubsub }),
        }),
    );


    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, 'client/build')));

        app.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
        });
    }

    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
}

startApolloServer();