const { mergeTypeDefs } = require('@graphql-tools/merge');
const typeTypeDef = require('./type.typeDef.js');

const mergedTypeDef = mergeTypeDefs([
    typeTypeDef
]);

module.exports = mergedTypeDef;