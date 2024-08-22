const conversationTypeDef = `#graphql
    input MessageHistory {
        role: String!
        content: String!
    }

    type Mutation {
        askAI(templateId: Int!, newMessage: String!, history: [MessageHistory!]): String
    }
`;