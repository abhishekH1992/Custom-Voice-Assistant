const { mergeResolvers } = require('@graphql-tools/merge');
const typeResolver = require('./type.resolver.js');
const voicesResolver = require('./voices.resolver.js');
const templatesResolver = require('./templates.resolver.js');

const mergedResolver = mergeResolvers([
    typeResolver,
    voicesResolver,
    templatesResolver
]);

module.exports = mergedResolver;