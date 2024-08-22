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

export const GET_TEMPLATE_BY_SLUG = gql`
    query GetTemplateBySlug($slug: String!) {
        templateBySlug(slug: $slug) {
            id
            aiRole
            icon
            slug
            description
            prompt
            aiVoice
        }
    }
`;