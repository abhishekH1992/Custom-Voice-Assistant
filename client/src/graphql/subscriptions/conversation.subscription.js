import { gql } from "@apollo/client";

export const MESSAGE_SUBSCRIPTION = gql`
    subscription MessageStreamed($templateId: ID!) {
        messageStreamed(templateId: $templateId) {
            content
            isUserMessage
        }
    }
`;

export const AUDIO_SUBSCRIPTION = gql`
    subscription AudioStreamed($templateId: ID!) {
        audioStreamed(templateId: $templateId) {
            audio
        }
    }
`;