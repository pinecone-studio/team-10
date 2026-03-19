export const DistributionTypeDefs = `
  type EmployeeDirectoryEntry {
    id: ID!
    fullName: String!
    email: String!
    role: String!
    position: String!
    isActive: Boolean!
  }

  type AssignmentAcknowledgmentPreview {
    acknowledgmentId: ID!
    assignmentRequestId: ID!
    assetId: ID!
    assetCode: String!
    assetName: String!
    category: String!
    employeeId: ID!
    employeeName: String!
    employeeEmail: String!
    recipientRole: String!
    expiresAt: String!
    status: String!
    signedAt: String
    tokenConsumedAt: String
  }

  type AssignmentAcknowledgmentPdf {
    fileName: String!
    contentType: String!
    base64: String!
  }

  type SignAssignmentAcknowledgmentResult {
    acknowledgmentId: ID!
    pdfObjectKey: String
    pdfFileName: String
    pdfContentType: String!
    pdfBase64: String!
    status: String!
    signedAt: String
    distribution: DistributionRecord!
  }

  type TerminationResult {
    employeeId: ID!
    employeeName: String!
    terminatedAt: String!
    pendingAssetCount: Int!
    pendingAssets: [DistributionRecord!]!
    hrNotifiedCount: Int!
    employeeNotified: Boolean!
    emailStatus: String!
    emailError: String
  }

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
    employeeDirectory(activeOnly: Boolean): [EmployeeDirectoryEntry!]!
    assignmentAcknowledgment(token: String!): AssignmentAcknowledgmentPreview!
    assignmentAcknowledgmentPdf(token: String!): AssignmentAcknowledgmentPdf!
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
    signAssignmentAcknowledgment(
      token: String!
      signerName: String!
      signatureText: String!
    ): SignAssignmentAcknowledgmentResult!
    terminateEmployeeAssets(
      employeeId: ID!
      note: String
    ): TerminationResult!
  }
`;
