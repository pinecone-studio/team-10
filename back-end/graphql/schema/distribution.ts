export const DistributionTypeDefs = `
  type DistributionRecord {
    id: ID!
    assignmentRequestId: ID
    assetId: ID!
    assetCode: String!
    assetName: String!
    category: String!
    itemType: String!
    serialNumber: String
    conditionStatus: String!
    assetStatus: String!
    currentStorageId: ID
    currentStorageName: String
    employeeId: ID!
    employeeName: String!
    recipientRole: String!
    distributedByUserId: ID!
    distributedAt: String!
    status: String!
    returnedAt: String
    usageYears: String
    returnCondition: String
    returnPower: String
    note: String
    createdAt: String!
    updatedAt: String!
  }

  type Query {
    assetDistributions(includeReturned: Boolean): [DistributionRecord!]!
  }

  type Mutation {
    assignAssetDistribution(
      assetId: ID!
      employeeName: String!
      recipientRole: String
      note: String
    ): DistributionRecord!
    returnAssetDistribution(
      distributionId: ID!
      storageLocation: String
      usageYears: String
      returnCondition: String
      returnPower: String
      note: String
    ): DistributionRecord!
    sendDistributionNotification(
      distributionId: ID!
      message: String
    ): Boolean!
  }
`;
