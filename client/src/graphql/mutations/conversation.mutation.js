import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!) {
        sendMessage(templateId: $templateId, messages: $messages)
    }
`;

export const START_RECORDING = gql`
    mutation StartRecording {
        startRecording
    }
`;

export const STOP_RECORDING = gql`
    mutation StopRecording($templateId: ID!) {
        stopRecording(templateId: $templateId)
    }
`;

export const SEND_AUDIO_DATA = gql`
    mutation SendAudioData($data: String!) {
        sendAudioData(data: $data)
    }
`;