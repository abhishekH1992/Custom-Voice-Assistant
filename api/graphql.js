const { ApolloServer } = require('@apollo/server');
const { startServerAndCreateHandler } = require('@as-integrations/h3');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const jwt = require('jsonwebtoken');
const { User } = require('../server/models');
const mergedTypeDef = require('../server/typeDefs/index.js');
const mergedResolver = require('../server/resolvers/index.js');
const { getRedisClient } = require('../server/utils/redis.util.js');

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

const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const token = req.headers.authorization || '';
      const user = await authenticate(token);
      const redis = await getRedisClient();
      return { user, redis };
    },
});

export default startServerAndCreateHandler(server);