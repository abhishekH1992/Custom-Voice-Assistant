import { gql } from "@apollo/client";

export const ASK_AI = gql`
    mutation askAI($templateId: Int!, $newMessage: String!, $history:[MessageHistory!]) {
        askAI(templateId: $templateId, newMessage: $newMessage, history: $history)
    }
`;