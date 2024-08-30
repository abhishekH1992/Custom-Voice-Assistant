const { GraphQLUpload } = require('graphql-upload-minimal');

const conversationTypeDef = `#graphql
    scalar Upload

    input InputMessage {
        role: String!,
        content: String!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudio(templateId: ID!, audio: Upload!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): String
        audioStreamed(templateId: ID!): String
    }
`;

module.exports = {
    typeDefs: conversationTypeDef,
    resolvers: {
        Upload: GraphQLUpload
    }
};