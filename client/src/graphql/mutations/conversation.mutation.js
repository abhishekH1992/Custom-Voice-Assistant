import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!) {
        sendMessage(templateId: $templateId, messages: $messages)
    }
`;

export const SEND_AUDIO_MESSAGE = gql`
    mutation SendAudioMessage($templateId: ID!, $messages: [InputMessage!]!, $userTranscribe: String!) {
        sendAudioMessage(templateId: $templateId, messages: $messages, userTranscribe: $userTranscribe)
    }
`;