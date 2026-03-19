export const AssetTypeDefs = `
  type AssetLabelPdf {
    fileName: String!
    contentType: String!
    base64: String!
    assetCount: Int!
  }

  type StorageAsset {
    id: ID!
    assetCode: String!
    qrCode: String!
    assetName: String!
    category: String!
    itemType: String!
    serialNumber: String
    conditionStatus: String!
    assetStatus: String!
    storageId: ID
    storageName: String!
    storageType: String
    receivedAt: String!
    receiveNote: String
    orderId: ID!
    requestNumber: String!
    requestDate: String!
    requester: String!
    department: String!
    unitCost: Float
    currencyCode: String!
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    storageAssets: [StorageAsset!]!
    asset(id: ID, qrCode: String): StorageAsset
    assetLabelPdf(assetCodes: [String!]!): AssetLabelPdf!
  }

  type Mutation {
    updateStorageAsset(
      id: ID!
      assetStatus: String
      conditionStatus: String
    ): StorageAsset!
  }
`;
