import { gql } from "@apollo/client";

export const MESSAGE_SUBSCRIPTION = gql`
    subscription MessageStreamed($templateId: ID!) {
        messageStreamed(templateId: $templateId) {
            role
            content
            type
        }
    }
`;

export const AUDIO_SUBSCRIPTION = gql`
    subscription AudioStreamed($templateId: ID!) {
        audioStreamed(templateId: $templateId) {
            content
        }
    }
`;

export const STREAM_STOPPED_SUBSCRIPTION = gql`
    subscription StreamStopped($templateId: ID!) {
        streamStopped(templateId: $templateId) {
            templateId
        }
    }
`;