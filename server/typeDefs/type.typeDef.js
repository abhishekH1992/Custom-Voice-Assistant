const typeTypeDef = `#graphql
    type Type {
        id: ID!
        name: String!
        description: String
        isAudio: Boolean
        duration: Int
        isText: Boolean
        isActive: Boolean
        icon: String
    }
    type Query {
        types: [Type!]
    }
`;

module.exports = typeTypeDef;