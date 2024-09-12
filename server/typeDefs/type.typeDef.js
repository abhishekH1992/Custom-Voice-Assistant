const typeTypeDef = `#graphql
    type Type {
        id: ID!
        name: String!
        description: String
        isAudio: Boolean
        duration: Int
        isText: Boolean
        isActive: Boolean
        isAutomatic: Boolean
        isContinous: Boolean
        icon: String
    }
    type Query {
        types(isActive: Boolean): [Type!]
    }
`;

module.exports = typeTypeDef;