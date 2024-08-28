const conversationTypeDef = `#graphql
    type Query {
    hello: String
  }

  type Mutation {
    sendMessage(templateId: ID!, message: String!): Boolean
  }

  type Subscription {
    messageStreamed(templateId: ID!): String
  }
`;

module.exports = conversationTypeDef;