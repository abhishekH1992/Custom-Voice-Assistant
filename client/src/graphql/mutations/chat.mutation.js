import { gql } from '@apollo/client';

export const SAVE_CHAT = gql`
    mutation SaveChat($input: SaveChatInput!) {
        saveChat(input: $input) {
            success
            message
            savedChat {
                id
                userId
                templateId
                chats {
                    role
                    content
                    type
                    timeStamp
                }
                name
            }
        }
    }
`;

export const DELETE_CHAT = gql`
    mutation DeleteChat($savedChatId: ID!, $userId: ID!) {
        deleteChat(savedChatId: $savedChatId, userId: $userId)
    }
`;