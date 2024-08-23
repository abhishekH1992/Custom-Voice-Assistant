import { gql } from "@apollo/client";

export const AI_RESPONSE_STREAM = gql`
    subscription AiResponseStream($templateId: Int!) {
        aiResponseStream(templateId: $templateId) {
            templateId
            chunk
            done
        }
    }
`;