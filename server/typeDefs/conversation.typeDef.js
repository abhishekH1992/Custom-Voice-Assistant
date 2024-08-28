const conversationTypeDef = `#graphql
    type Mutation {
        sendMessage(templateId: ID!, message: String!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): String
    }
`;

module.exports = conversationTypeDef;