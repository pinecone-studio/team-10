export const ReceiveTypeDefs = `
  type Receive {
    id: ID!
    orderId: ID!
    receivedByUserId: ID!
    officeId: ID!
    status: String!
    receivedAt: String!
    note: String
  }

  type Query {
    receives: [Receive!]!
    receive(id: ID!): Receive
  }

  type Mutation {
    createReceive(
      orderId: ID
      receivedByUserId: ID
      officeId: ID
      status: String!
      receivedAt: String
      note: String
    ): Receive!
    updateReceive(
      id: ID!
      orderId: ID
      receivedByUserId: ID
      officeId: ID
      status: String
      receivedAt: String
      note: String
    ): Receive
    deleteReceive(id: ID!): Boolean!
  }
`;
