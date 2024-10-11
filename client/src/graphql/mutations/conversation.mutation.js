import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!, $type: String!) {
        sendMessage(templateId: $templateId, messages: $messages, type: $type)
    }
`;

export const START_RECORDING = gql`
    mutation StartRecording {
        startRecording
    }
`;

export const STOP_RECORDING = gql`
    mutation StopRecording($templateId: ID!, $messages: [InputMessage!]!) {
        stopRecording(templateId: $templateId, messages: $messages)
    }
`;

export const SEND_AUDIO_DATA = gql`
    mutation SendAudioData($data: String!) {
        sendAudioData(data: $data)
    }
`;

export const STOP_STREAMING = gql`
    mutation StopStreaming($templateId: ID!) {
        stopStreaming(templateId: $templateId)
    }
`;