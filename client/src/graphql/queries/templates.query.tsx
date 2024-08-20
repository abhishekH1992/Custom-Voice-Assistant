import { gql } from "@apollo/client";

export const GET_TEMPLATES = gql`
    query GetAllTemplates($isActive: Boolean) {
        templates(isActive: $isActive) {
            aiRole
            icon
            slug
            description
        }
    }
`;