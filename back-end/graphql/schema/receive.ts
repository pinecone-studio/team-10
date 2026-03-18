export const ReceiveTypeDefs = `
  type Receive {
    id: ID!
    orderId: ID!
    orderItemId: ID!
    quantityReceived: Int!
    conditionStatus: String!
    receivedCondition: String
    storageLocation: String
    serialNumbers: [String!]!
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
      orderId: ID!
      orderItemId: ID!
      quantityReceived: Int!
      conditionStatus: String!
      receivedAt: String
      receivedCondition: String
      note: String
      storageLocation: String
      serialNumbers: [String!]
    ): Receive!
    updateReceive(
      id: ID!
      orderId: ID
      orderItemId: ID
      quantityReceived: Int
      conditionStatus: String
      receivedAt: String
      receivedCondition: String
      note: String
      storageLocation: String
      serialNumbers: [String!]
    ): Receive
    deleteReceive(id: ID!): Boolean!
  }
`;
