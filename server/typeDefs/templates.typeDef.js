const templatesTypeDef = `#graphql
    type Templates {
        id: ID!
        aiRole: String!
        isActive: String!
        prompt: String!
        aiVoice: Int!
        icon: String!
        slug: String!
        description: String
    }
    type Query {
        templates(isActive: Boolean): [Templates!]
    }
`;

module.exports = templatesTypeDef;