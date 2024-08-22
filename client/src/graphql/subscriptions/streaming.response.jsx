import { gql } from "@apollo/client";

export const SUBSCRIPTION_AI = gql`
    subscription StreamingResponse($templateId: Int!, $newMessage: String!, $history:[MessageHistory!]) {
        streamingResponse(templateId: $templateId, newMessage: $newMessage, history: $history)
    }
`;