export const AssetTypeDefs = `
  type StorageAssetAttribute {
    attributeName: String!
    attributeValue: String!
  }

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
    assetImageDataUrl: String
    conditionStatus: String!
    assetStatus: String!
    assignedEmployeeName: String
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
    assetAttributes: [StorageAssetAttribute!]!
    unitCost: Float
    currencyCode: String!
    createdAt: String!
    updatedAt: String!
  }

  type AssetAuditEntry {
    id: ID!
    assetId: ID!
    title: String!
    status: String!
    owner: String!
    location: String!
    date: String!
    note: String
  }

  type Query {
    storageAssets: [StorageAsset!]!
    storageLocations: [String!]!
    asset(id: ID, qrCode: String): StorageAsset
    assetLabelPdf(assetCodes: [String!]!): AssetLabelPdf!
    assetAuditHistory(assetId: ID!): [AssetAuditEntry!]!
  }

  type Mutation {
    updateStorageAsset(
      id: ID!
      assetStatus: String
      conditionStatus: String
    ): StorageAsset!
    createAssetAudit(
      assetIds: [ID!]!
      confirmedLocation: String
      conditionStatus: String
      assetStatus: String
      note: String
    ): [AssetAuditEntry!]!
  }
`;
