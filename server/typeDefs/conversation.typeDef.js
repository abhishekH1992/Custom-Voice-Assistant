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

    type AudioStreamedPayload {
        content: String!
    }

    type StreamStopped {
        templateId: ID!
    }

    type Mutation {
        sendMessage(templateId: ID!, messages: [InputMessage!]!, type: String!): Boolean
        stopRecording(templateId: ID!, messages: [InputMessage!]!, type: String!): Boolean
        stopStreaming(templateId: ID!): Boolean!
    }

    type Subscription {
        messageStreamed(templateId: ID!): OutputMessage!
        audioStreamed(templateId: ID!): AudioStreamedPayload!
        streamStopped(templateId: ID!): StreamStopped!
    }
`;

module.exports = conversationTypeDef;