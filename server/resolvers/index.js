const { mergeResolvers } = require('@graphql-tools/merge');
const typeResolver = require('./type.resolver.js');

const mergedResolver = mergeResolvers([
    typeResolver
]);

module.exports = mergedResolver;