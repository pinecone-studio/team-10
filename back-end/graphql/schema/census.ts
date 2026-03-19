export const CensusTypeDefs = `
  type CensusSession {
    id: ID!
    title: String!
    scopeType: String!
    scopeValue: String
    createdByUserId: ID!
    createdByName: String!
    status: String!
    dueAt: String!
    completedAt: String
    note: String
    createdAt: String!
    updatedAt: String!
  }

  type CensusTask {
    id: ID!
    censusSessionId: ID!
    assetId: ID!
    assetCode: String!
    assetName: String!
    category: String!
    itemType: String!
    qrCode: String!
    serialNumber: String
    employeeId: ID!
    employeeName: String!
    employeeEmail: String!
    departmentName: String
    baselineConditionStatus: String!
    baselineAssetStatus: String!
    baselineLocation: String
    reportedConditionStatus: String
    status: String!
    verificationChannel: String
    verifiedAt: String
    verifiedByUserId: ID
    verifiedByName: String
    note: String
    discrepancyReason: String
    portalExpiresAt: String
    portalEmailStatus: String!
    portalEmailSentAt: String
    createdAt: String!
    updatedAt: String!
  }

  type CensusReport {
    sessionId: ID!
    totalAssets: Int!
    verifiedCount: Int!
    verifiedPercentage: Int!
    discrepancyCount: Int!
    conditionChangeCount: Int!
    actionItems: [String!]!
  }

  type Query {
    censusSessions(includeCompleted: Boolean): [CensusSession!]!
    censusSession(id: ID!): CensusSession
    censusTasks(sessionId: ID!): [CensusTask!]!
    censusReport(sessionId: ID!): CensusReport!
    censusPortalVerification(token: String!): CensusTask!
  }

  type Mutation {
    createCensusSession(
      title: String!
      scopeType: String!
      scopeValue: String
      dueAt: String!
      note: String
    ): CensusSession!
    completeCensusSession(id: ID!): CensusSession!
    verifyCensusTaskByQr(
      qrCode: String!
      conditionStatus: String
      note: String
    ): CensusTask!
    verifyCensusTaskByPortal(
      token: String!
      conditionStatus: String
      note: String
    ): CensusTask!
  }
`;
