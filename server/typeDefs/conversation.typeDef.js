const conversationTypeDef = `#graphql
    input InputMessage {
        role: String!,
        content: String!
    }

    type OutputMessage {
        role: String!,
        content: String!
    }

    type UserStreamedPayload {
        content: String!
    }

    type AudioStreamedPayload {
        content: String!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioMessage(templateId: ID!, messages: [InputMessage!]!, userTranscribe: String!): Boolean
        startRecording: Boolean
        stopRecording(templateId: ID!, messages: [InputMessage!]!): Boolean
        sendAudioData(data: String!): Boolean
    }

    type Subscription {
        messageStreamed(templateId: ID!): OutputMessage!
        audioStreamed(templateId: ID!): AudioStreamedPayload!
        userStreamed(templateId: ID!): UserStreamedPayload!
    }
`;

module.exports = conversationTypeDef;