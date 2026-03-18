export const AssetTypeDefs = `
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
  }
`;
