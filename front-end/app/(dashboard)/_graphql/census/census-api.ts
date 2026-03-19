"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";

export type CensusSessionDto = {
  id: string;
  title: string;
  scopeType: string;
  scopeValue: string | null;
  createdByUserId: string;
  createdByName: string;
  status: string;
  dueAt: string;
  completedAt: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CensusTaskDto = {
  id: string;
  censusSessionId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  qrCode: string;
  serialNumber: string | null;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentName: string | null;
  baselineConditionStatus: string;
  baselineAssetStatus: string;
  baselineLocation: string | null;
  reportedConditionStatus: string | null;
  status: string;
  verificationChannel: string | null;
  verifiedAt: string | null;
  verifiedByUserId: string | null;
  verifiedByName: string | null;
  note: string | null;
  discrepancyReason: string | null;
  portalExpiresAt: string | null;
  portalEmailStatus: string;
  portalEmailSentAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CensusReportDto = {
  sessionId: string;
  totalAssets: number;
  verifiedCount: number;
  verifiedPercentage: number;
  discrepancyCount: number;
  conditionChangeCount: number;
  actionItems: string[];
};

const sessionFields = gql`
  fragment CensusSessionFields on CensusSession {
    id
    title
    scopeType
    scopeValue
    createdByUserId
    createdByName
    status
    dueAt
    completedAt
    note
    createdAt
    updatedAt
  }
`;

const taskFields = gql`
  fragment CensusTaskFields on CensusTask {
    id
    censusSessionId
    assetId
    assetCode
    assetName
    category
    itemType
    qrCode
    serialNumber
    employeeId
    employeeName
    employeeEmail
    departmentName
    baselineConditionStatus
    baselineAssetStatus
    baselineLocation
    reportedConditionStatus
    status
    verificationChannel
    verifiedAt
    verifiedByUserId
    verifiedByName
    note
    discrepancyReason
    portalExpiresAt
    portalEmailStatus
    portalEmailSentAt
    createdAt
    updatedAt
  }
`;

const sessionsQuery = gql`
  ${sessionFields}
  query CensusSessions($includeCompleted: Boolean) {
    censusSessions(includeCompleted: $includeCompleted) {
      ...CensusSessionFields
    }
  }
`;

const tasksQuery = gql`
  ${taskFields}
  query CensusTasks($sessionId: ID!) {
    censusTasks(sessionId: $sessionId) {
      ...CensusTaskFields
    }
  }
`;

const reportQuery = gql`
  query CensusReport($sessionId: ID!) {
    censusReport(sessionId: $sessionId) {
      sessionId
      totalAssets
      verifiedCount
      verifiedPercentage
      discrepancyCount
      conditionChangeCount
      actionItems
    }
  }
`;

const createMutation = gql`
  ${sessionFields}
  mutation CreateCensusSession($title: String!, $scopeType: String!, $scopeValue: String, $dueAt: String!, $note: String) {
    createCensusSession(title: $title, scopeType: $scopeType, scopeValue: $scopeValue, dueAt: $dueAt, note: $note) {
      ...CensusSessionFields
    }
  }
`;

const completeMutation = gql`
  ${sessionFields}
  mutation CompleteCensusSession($id: ID!) {
    completeCensusSession(id: $id) {
      ...CensusSessionFields
    }
  }
`;

const portalQuery = gql`
  ${taskFields}
  query CensusPortalVerification($token: String!) {
    censusPortalVerification(token: $token) {
      ...CensusTaskFields
    }
  }
`;

const verifyPortalMutation = gql`
  ${taskFields}
  mutation VerifyCensusTaskByPortal($token: String!, $conditionStatus: String, $note: String) {
    verifyCensusTaskByPortal(token: $token, conditionStatus: $conditionStatus, note: $note) {
      ...CensusTaskFields
    }
  }
`;

const verifyQrMutation = gql`
  ${taskFields}
  mutation VerifyCensusTaskByQr($qrCode: String!, $conditionStatus: String, $note: String) {
    verifyCensusTaskByQr(qrCode: $qrCode, conditionStatus: $conditionStatus, note: $note) {
      ...CensusTaskFields
    }
  }
`;

export async function fetchCensusSessionsRequest(includeCompleted = true) {
  const { data } = await apolloClient.query<{ censusSessions: CensusSessionDto[] }>({
    query: sessionsQuery,
    variables: { includeCompleted },
    fetchPolicy: "no-cache",
  });
  return data?.censusSessions ?? [];
}

export async function fetchCensusTasksRequest(sessionId: string) {
  const { data } = await apolloClient.query<{ censusTasks: CensusTaskDto[] }>({
    query: tasksQuery,
    variables: { sessionId },
    fetchPolicy: "no-cache",
  });
  return data?.censusTasks ?? [];
}

export async function fetchCensusReportRequest(sessionId: string) {
  const { data } = await apolloClient.query<{ censusReport: CensusReportDto }>({
    query: reportQuery,
    variables: { sessionId },
    fetchPolicy: "no-cache",
  });
  return data?.censusReport ?? null;
}

export async function createCensusSessionRequest(input: {
  title: string;
  scopeType: string;
  scopeValue?: string | null;
  dueAt: string;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{ createCensusSession: CensusSessionDto }>({
    mutation: createMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });
  return data?.createCensusSession ?? null;
}

export async function completeCensusSessionRequest(id: string) {
  const { data } = await apolloClient.mutate<{ completeCensusSession: CensusSessionDto }>({
    mutation: completeMutation,
    variables: { id },
    fetchPolicy: "no-cache",
  });
  return data?.completeCensusSession ?? null;
}

export async function fetchCensusPortalVerificationRequest(token: string) {
  const { data } = await apolloClient.query<{ censusPortalVerification: CensusTaskDto }>({
    query: portalQuery,
    variables: { token },
    fetchPolicy: "no-cache",
  });
  return data?.censusPortalVerification ?? null;
}

export async function verifyCensusTaskByPortalRequest(input: {
  token: string;
  conditionStatus?: string | null;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{ verifyCensusTaskByPortal: CensusTaskDto }>({
    mutation: verifyPortalMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });
  return data?.verifyCensusTaskByPortal ?? null;
}

export async function verifyCensusTaskByQrRequest(input: {
  qrCode: string;
  conditionStatus?: string | null;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{ verifyCensusTaskByQr: CensusTaskDto }>({
    mutation: verifyQrMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });
  return data?.verifyCensusTaskByQr ?? null;
}
