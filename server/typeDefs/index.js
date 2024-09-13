const { mergeTypeDefs } = require('@graphql-tools/merge');
const typeTypeDef = require('./type.typeDef.js');
const voiceTypeDef = require('./voices.typeDef.js');
const templatesTypeDef = require('./templates.typeDef.js');
const conversationTypeDef = require('./conversation.typeDef.js');
const userTypeDef = require('./user.typeDef.js');

const mergedTypeDef = mergeTypeDefs([
    typeTypeDef,
    voiceTypeDef,
    templatesTypeDef,
    conversationTypeDef,
    userTypeDef
]);

module.exports = mergedTypeDef;