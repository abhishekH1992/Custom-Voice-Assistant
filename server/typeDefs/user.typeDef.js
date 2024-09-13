const userTypeDef = `#graphql
    type User {
        id: ID!
        firstName: String!
        lastName: String!
        email: String!
    }
    type AuthPayload {
        token: String!
        user: User!
    }
    type Mutation {
        register(firstName: String!, lastName: String!, email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
    }
    type Query {
        me: User
    }
`;

module.exports = userTypeDef;