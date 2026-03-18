export const ReceiveTypeDefs = `
  type ReceivedAsset {
    id: ID!
    assetCode: String!
    qrCode: String!
    assetName: String!
    serialNumber: String
    conditionStatus: String!
    assetStatus: String!
    currentStorageId: ID
  }

  type ReceiveOrderItemPayload {
    receive: Receive!
    order: Order!
    assets: [ReceivedAsset!]!
  }

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
    receiveOrderItem(
      orderId: ID!
      catalogId: ID
      itemCode: String!
      quantityReceived: Int!
      receivedAt: String
      receivedCondition: String!
      receivedNote: String
      storageLocation: String
      serialNumbers: [String!]
      receivedByUserId: ID
      officeId: ID
    ): ReceiveOrderItemPayload!
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
