const voiceTypeDef = `#graphql
    type Voices {
        id: ID!
        name: String!
    }
    type Query {
        voices: [Voices!]
    }
`;

module.exports = voiceTypeDef;