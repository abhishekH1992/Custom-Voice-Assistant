const conversationTypeDef = `#graphql
    input MessageHistory {
        role: String!
        content: String!
    }

    type AIStreamResponse {
        templateId: Int!
        chunk: String!
        done: Boolean!
    }

    type Mutation {
        askAI(templateId: Int!, newMessage: String!, history: [MessageHistory!]): String
    }

    type Subscription {
        aiResponseStream(templateId: Int!): AIStreamResponse!
    }
`;

module.exports = conversationTypeDef;