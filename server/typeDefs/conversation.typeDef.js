const conversationTypeDef = `#graphql
    input InputMessage {
        role: String!,
        content: String!
    }

    type StreamedContent {
        content: String!,
        isUserMessage: Boolean!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!): Boolean
        startRecording: Boolean
        stopRecording(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioData(data: String!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): StreamedContent!
    }
`;

module.exports = conversationTypeDef;