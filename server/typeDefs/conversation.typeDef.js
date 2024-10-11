const conversationTypeDef = `#graphql
    input InputMessage {
        role: String!,
        content: String!,
        type: String!
        timeStamp: String!
    }

    type OutputMessage {
        role: String!,
        content: String!
        type: String!
    }

    type UserStreamedPayload {
        content: String!
    }

    type AudioStreamedPayload {
        content: String!
    }

    type StreamStopped {
        templateId: ID!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!, type: String!): Boolean
        startRecording: Boolean
        stopRecording(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioData(data: String!): Boolean
        stopStreaming(templateId: ID!): Boolean!
    }

    type Subscription {
        messageStreamed(templateId: ID!): OutputMessage!
        audioStreamed(templateId: ID!): AudioStreamedPayload!
        userStreamed(templateId: ID!): UserStreamedPayload!
        streamStopped(templateId: ID!): StreamStopped!
    }
`;

module.exports = conversationTypeDef;