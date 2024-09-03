const conversationTypeDef = `#graphql
    input InputMessage {
        role: String!,
        content: String!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioChunk(templateId: ID!, audioChunk: String!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): String
    }
`;

module.exports = conversationTypeDef;