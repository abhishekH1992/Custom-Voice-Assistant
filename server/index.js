const express = require('express');
const http = require('http');
const cors = require('cors');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer');
const path = require('path');
const mergedTypeDef = require('./typeDefs/index.js');
const mergedResolver = require('./resolvers/index.js');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const dotenv = require('dotenv');


dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;

async function startApolloServer() {
    const schema = makeExecutableSchema({
        typeDefs: mergedTypeDef,
        resolvers: mergedResolver,
    });

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/graphql',
    });

    const serverCleanup = useServer({ schema }, wsServer);

    const server = new ApolloServer({
        schema,
        plugins: [ApolloServerPluginDrainHttpServer({ httpServer }),
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
            context: async ({ req }) => ({ token: req.headers.token }),
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
}

startApolloServer();