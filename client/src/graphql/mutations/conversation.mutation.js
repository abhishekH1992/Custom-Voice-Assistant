import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!) {
        sendMessage(templateId: $templateId, messages: $messages)
    }
`;

export const SEND_AUDIO = gql`
    mutation SendAudio($templateId: ID!, $audio: Upload!) {
        sendAudio(templateId: $templateId, audio: $audio)
    }
`;