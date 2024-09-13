const chatTypeDef = `#graphql
    type Mutation {
        saveChat(input: SaveChatInput!): SaveChatResponse!
        deleteChat(savedChatId: ID!, userId:ID!): Boolean!
    }

    type Query {
        getSavedChatById(savedChatId: ID!, userId:ID!): SavedChat!
    }

    input SaveChatInput {
        userId: ID!
        templateId: ID!
        chats: [ChatMessageInput!]!
        name: String!
        id: ID
    }

    input ChatMessageInput {
        role: String!
        content: String!
    }

    type SaveChatResponse {
        success: Boolean!
        message: String
        savedChat: SavedChat
    }

    type SavedChat {
        id: ID!
        userId: ID!
        templateId: ID!
        chats: [ChatMessage!]!
        name: String!
    }

    type ChatMessage {
        role: String!
        content: String!
    }
`;

module.exports = chatTypeDef;