const chatTypeDef = `#graphql
    type Mutation {
        saveChat(input: SaveChatInput!): SaveChatResponse!
        deleteChat(savedChatId: ID!, userId:ID!): Boolean!
    }

    type Query {
        getSavedChatById(savedChatId: ID!, userId:ID!): SavedChat!
        getSavedChatAndFeedbackById(savedChatId: ID!, userId:ID!): SavedChat!
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
        chats: [ChatMessage!]
        name: String!
        feedback: Feedback
    }

    type ChatMessage {
        role: String!
        content: String!
    }

    type Feedback {
        accentEmotionAnalysis: AccentEmotionAnalysis
        toneSentimentOverview: ToneSentimentOverview
        pronunciationAnalysis: PronunciationAnalysis
        interactionSpeed: InteractionSpeed
        fillerWordAnalysis: FillerWordAnalysis
        loosingPromptContent: LoosingPromptContent
        confidenceScore: ConfidenceScore
        overview: Overview
    }

    type AccentEmotionAnalysis {
        accent: RatedKey!
        emotion: RatedKey!
    }

    type ToneSentimentOverview {
        tone: RatedKey!
        sentiment: RatedKey!
    }

    type PronunciationAnalysis {
        accuracy: RatedKey!
        clarity: RatedKey!
        issues: RatedKey!
    }

    type RatedKey {
        key: String!
        rate: Float!
    }

    type InteractionSpeed {
        speed: String!
        rate: Float!
        reflection: String!
    }

    type FillerWordAnalysis {
        fillerWords: [String!]!
        count: Int!
    }

    type LoosingPromptContent {
        isLosingContent: RatedKey!
        sectionsMissed: [String!]!
    }

    type ConfidenceScore {
        avgConfidence: Float!
        accentEmotionAnalysis: Float!
        toneSentimentOverview: Float!
        emotionTimeline: Float!
        toneSentimentTimeline: Float!
        keywordsWithContext: Float!
        pronunciationAnalysis: Float!
        interactionSpeed: Float!
        fillerWordAnalysis: Float!
        loosingPromptContent: Float!
        awareness: Float!
        proactive: Float!
    }

    type Overview {
        abstractSummary: String!
        keyPoints: String!
        actionItem: String!
        sentiment: String!
        awareness: String!
        proactive: String!
    }
`;

module.exports = chatTypeDef;