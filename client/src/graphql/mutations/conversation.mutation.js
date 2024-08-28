import { gql } from "@apollo/client";

export const SEND_MESSAGE = gql`
    mutation SendMessage($templateId: ID!, $messages: [InputMessage!]!) {
        sendMessage(templateId: $templateId, messages: $messages)
    }
`;