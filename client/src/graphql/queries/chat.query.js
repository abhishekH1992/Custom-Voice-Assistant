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