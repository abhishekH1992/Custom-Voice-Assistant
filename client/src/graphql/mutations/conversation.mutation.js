import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!, $type: String!) {
        sendMessage(templateId: $templateId, messages: $messages, type: $type)
    }
`;

export const STOP_RECORDING = gql`
    mutation StopRecording($templateId: ID!, $messages: [InputMessage!]!, $type: String!) {
        stopRecording(templateId: $templateId, messages: $messages, type: $type)
    }
`;

export const STOP_STREAMING = gql`
    mutation StopStreaming($templateId: ID!) {
        stopStreaming(templateId: $templateId)
    }
`;