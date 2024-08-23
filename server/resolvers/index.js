const { mergeResolvers } = require('@graphql-tools/merge');
const typeResolver = require('./type.resolver.js');
const voicesResolver = require('./voices.resolver.js');
const templatesResolver = require('./templates.resolver.js');
const conversationResolver = require('./conversation.resolver.js');

const mergedResolver = mergeResolvers([
    typeResolver,
    voicesResolver,
    templatesResolver,
    conversationResolver
]);

module.exports = mergedResolver;