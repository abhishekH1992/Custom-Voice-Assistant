const chatTypeDef = `#graphql
    type Mutation {
        saveChat(input: SaveChatInput!): SaveChatResponse!
        deleteChat(savedChatId: ID!, userId:ID!): Boolean!
    }

    type Query {
        getSavedChatById(savedChatId: ID!, userId:ID!): SavedChat!
        getSavedChatAndFeedbackById(savedChatId: ID!, userId:ID!): SavedChat!
        getUsersSavedTemplateListByUserId(userId:ID!): [UserChatList!]
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
        type: String!
        timeStamp: String!
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
        table: [ConversationTableFeedback!]
    }

    type ChatMessage {
        role: String!
        content: String!
        type: String!
        timeStamp: String!
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

    type ConversationTableFeedback {
        role: String!
        content: String!
        feedback: String
        rate: Float
    }

    type UserChatList {
        id: ID!
        name: String!
        template: Template
    }

    type Template {
        icon: String!
        slug: String!
        description: String
        aiRole: String!
    }
`;

module.exports = chatTypeDef;