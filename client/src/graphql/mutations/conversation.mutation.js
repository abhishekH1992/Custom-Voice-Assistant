import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!) {
        sendMessage(templateId: $templateId, messages: $messages)
    }
`;

export const SEND_AUDIO_CHUNK = gql`
    mutation SendAudioChunk($templateId: ID!, $audioChunk: String!) {
        sendAudioChunk(templateId: $templateId, audioChunk: $audioChunk)
    }
`;