const typeTypeDef = `#graphql
    type Type {
        id: ID!
        name: String!
        description: String
        isAudio: Boolean
        duration: Int
        isText: Boolean
        isActive: Boolean
    }
    type Query {
        getTypes: [Type!]
        getActiveTypes: [Type!]
    }
`;

module.exports = typeTypeDef;