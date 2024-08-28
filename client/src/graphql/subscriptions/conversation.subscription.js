import { gql } from "@apollo/client";

export const MESSAGE_SUBSCRIPTION = gql`
    subscription MessageStreamed($templateId: ID!) {
        messageStreamed(templateId: $templateId)
    }
`;

export const AUDIO_SUBSCRIPTION = gql`
    subscription OnAudioTranscribed {
        audioTranscribed {
            text
        }
    }
`;