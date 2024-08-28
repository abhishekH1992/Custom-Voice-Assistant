import { gql } from "@apollo/client";
export const SEND_MESSAGE = gql`
  mutation SendMessage($templateId: ID!, $message: String!) {
    sendMessage(templateId: $templateId, message: $message)
  }
`;