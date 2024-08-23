const conversationTypeDef = `#graphql
    type Subscription {
        chatResponse(message: String!): ChatResponse!
    }

    type ChatResponse {
        content: String!
        done: Boolean!
    }

    type Mutation {
        sendMessage(message: String!): Boolean!
    }
`;

module.exports = conversationTypeDef;