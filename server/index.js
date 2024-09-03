const express = require('express');
const http = require('http');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const cors = require('cors');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

const schema = makeExecutableSchema({
    typeDefs: mergedTypeDef,
    resolvers: mergedResolver,
});

async function startApolloServer() {
    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);

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
            origin: 'http://localhost:3000',
            credentials: true,
        }),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req }) => ({ token: req.headers.token }),
        })
    );

    await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
}

startApolloServer();