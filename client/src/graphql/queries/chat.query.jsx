import { gql } from "@apollo/client";

export const GET_SAVED_CHAT = gql`
    query GetSavedChatById($savedChatId: ID!, $userId: ID!) {
        getSavedChatById(savedChatId: $savedChatId, userId: $userId) {
            id
            userId
            templateId
            chats {
                role
                content
            }
            name
        }
    }
`;

export const GET_SAVED_CHAT_AND_GENERATE_FEEDBACK = gql`
    query GetSavedChatAndFeedbackById($savedChatId: ID!, $userId: ID!) {
        getSavedChatAndFeedbackById(savedChatId: $savedChatId, userId: $userId) {
            id
            userId
            templateId
            name
            chats {
                role
                content
            }
            feedback {
                accentEmotionAnalysis {
                    accent {
                        key
                        rate
                    }
                    emotion {
                        key
                        rate
                    }
                }
                toneSentimentOverview {
                    tone {
                        key
                        rate
                    }
                    sentiment {
                        key
                        rate
                    }
                }
                pronunciationAnalysis {
                    accuracy {
                        key
                        rate
                    }
                    clarity {
                        key
                        rate
                    }
                    issues {
                        key
                        rate
                    }
                }
                interactionSpeed {
                    speed
                    rate
                    reflection
                }
                fillerWordAnalysis {
                    fillerWords
                    count
                }
                loosingPromptContent {
                    isLosingContent {
                        key
                        rate
                    }
                    sectionsMissed
                }
                confidenceScore {
                    avgConfidence
                    accentEmotionAnalysis
                    toneSentimentOverview
                    emotionTimeline
                    toneSentimentTimeline
                    keywordsWithContext
                    pronunciationAnalysis
                    interactionSpeed
                    fillerWordAnalysis
                    loosingPromptContent
                    awareness
                    proactive
                }
                overview {
                    abstractSummary
                    keyPoints
                    actionItem
                    sentiment
                    awareness
                    proactive
                }
            }
            table {
                role
                content
                feedback
                rate
            }
        }
    }
`;