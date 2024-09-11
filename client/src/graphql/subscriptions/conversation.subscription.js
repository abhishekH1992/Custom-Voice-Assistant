import { gql } from "@apollo/client";

export const MESSAGE_SUBSCRIPTION = gql`
    subscription MessageStreamed($templateId: ID!) {
        messageStreamed(templateId: $templateId) {
            role
            content
        }
    }
`;

export const AUDIO_SUBSCRIPTION = gql`
    subscription AudioStreamed($templateId: ID!) {
        audioStreamed(templateId: $templateId) {
            role
            content
        }
    }
`;

export const USER_SUBSCRIPTION = gql`
    subscription UserStreamed($templateId: ID!) {
        userStreamed(templateId: $templateId) {
            content
        }
    }
`;