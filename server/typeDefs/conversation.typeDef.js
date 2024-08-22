const conversationTypeDef = `#graphql
    input MessageHistory {
        role: String!
        content: String!
    }
    
    type Subscription {
        streamingResponse(templateId: Int!, newMessage: String!, history: [MessageHistory!]): String!
    }

    type Mutation {
        askAI(templateId: Int!, newMessage: String!, history: [MessageHistory!]): String
    }
`;

module.exports = conversationTypeDef;