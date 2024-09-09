const conversationTypeDef = `#graphql
    input InputMessage {
        role: String!,
        content: String!
    }

    type OutputMessage {
        role: String!,
        content: String!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!): Boolean
        startRecording: Boolean
        stopRecording(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioData(data: String!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): OutputMessage!
    }
`;

module.exports = conversationTypeDef;