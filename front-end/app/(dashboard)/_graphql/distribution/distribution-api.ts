"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";

export type DistributionRecordDto = {
  id: string;
  assignmentRequestId: string | null;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  currentStorageId: string | null;
  currentStorageName: string | null;
  employeeId: string;
  employeeName: string;
  recipientRole: string;
  distributedByUserId: string;
  distributedAt: string;
  status: string;
  returnedAt: string | null;
  usageYears: string | null;
  returnCondition: string | null;
  returnPower: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeDirectoryEntryDto = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  position: string;
  departmentId: string | null;
  departmentName: string | null;
  isActive: boolean;
};

export type AssignmentAcknowledgmentPreviewDto = {
  acknowledgmentId: string;
  assignmentRequestId: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  category: string;
  customAttributes: Array<{
    attributeName: string;
    attributeValue: string;
  }>;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  recipientRole: string;
  expiresAt: string;
  status: string;
  signedAt: string | null;
  tokenConsumedAt: string | null;
};

export type AssignmentAcknowledgmentPdfDto = {
  fileName: string;
  contentType: string;
  base64: string;
};

export type SignAssignmentAcknowledgmentResultDto = {
  acknowledgmentId: string;
  pdfObjectKey: string | null;
  pdfFileName: string | null;
  pdfContentType: string;
  pdfBase64: string;
  status: string;
  signedAt: string | null;
  distribution: DistributionRecordDto;
};

export type TerminationResultDto = {
  employeeId: string;
  employeeName: string;
  terminatedAt: string;
  pendingAssetCount: number;
  pendingAssets: DistributionRecordDto[];
  hrNotifiedCount: number;
  employeeNotified: boolean;
  emailStatus: string;
  emailError: string | null;
};

const distributionFields = gql`
  fragment DistributionFields on DistributionRecord {
    id
    assignmentRequestId
    assetId
    assetCode
    assetName
    category
    itemType
    serialNumber
    conditionStatus
    assetStatus
    currentStorageId
    currentStorageName
    employeeId
    employeeName
    recipientRole
    distributedByUserId
    distributedAt
    status
    returnedAt
    usageYears
    returnCondition
    returnPower
    note
    createdAt
    updatedAt
  }
`;

const employeeDirectoryQuery = gql`
  query EmployeeDirectory($activeOnly: Boolean) {
    employeeDirectory(activeOnly: $activeOnly) {
      id
      fullName
      email
      role
      position
      departmentId
      departmentName
      isActive
    }
  }
`;

const assignmentAcknowledgmentQuery = gql`
  query AssignmentAcknowledgment($token: String!) {
    assignmentAcknowledgment(token: $token) {
      acknowledgmentId
      assignmentRequestId
      assetId
      assetCode
      assetName
      category
      customAttributes {
        attributeName
        attributeValue
      }
      employeeId
      employeeName
      employeeEmail
      recipientRole
      expiresAt
      status
      signedAt
      tokenConsumedAt
    }
  }
`;

const assignmentAcknowledgmentPdfQuery = gql`
  query AssignmentAcknowledgmentPdf($token: String!) {
    assignmentAcknowledgmentPdf(token: $token) {
      fileName
      contentType
      base64
    }
  }
`;

const distributionsQuery = gql`
  ${distributionFields}
  query AssetDistributions($includeReturned: Boolean) {
    assetDistributions(includeReturned: $includeReturned) {
      ...DistributionFields
    }
  }
`;

const assignMutation = gql`
  ${distributionFields}
  mutation AssignAssetDistribution($assetId: ID!, $employeeId: ID, $employeeName: String!, $recipientRole: String, $note: String) {
    assignAssetDistribution(assetId: $assetId, employeeId: $employeeId, employeeName: $employeeName, recipientRole: $recipientRole, note: $note) {
      ...DistributionFields
    }
  }
`;

const returnMutation = gql`
  ${distributionFields}
  mutation ReturnAssetDistribution($distributionId: ID!, $storageLocation: String, $usageYears: String, $returnCondition: String, $returnPower: String, $note: String) {
    returnAssetDistribution(distributionId: $distributionId, storageLocation: $storageLocation, usageYears: $usageYears, returnCondition: $returnCondition, returnPower: $returnPower, note: $note) {
      ...DistributionFields
    }
  }
`;

const notifyMutation = gql`
  mutation SendDistributionNotification($distributionId: ID!, $message: String) {
    sendDistributionNotification(distributionId: $distributionId, message: $message)
  }
`;

const signAcknowledgmentMutation = gql`
  ${distributionFields}
  mutation SignAssignmentAcknowledgment($token: String!, $signerName: String!, $signatureText: String!) {
    signAssignmentAcknowledgment(token: $token, signerName: $signerName, signatureText: $signatureText) {
      acknowledgmentId
      pdfObjectKey
      pdfFileName
      pdfContentType
      pdfBase64
      status
      signedAt
      distribution {
        ...DistributionFields
      }
    }
  }
`;

const terminateMutation = gql`
  ${distributionFields}
  mutation TerminateEmployeeAssets($employeeId: ID!, $note: String) {
    terminateEmployeeAssets(employeeId: $employeeId, note: $note) {
      employeeId
      employeeName
      terminatedAt
      pendingAssetCount
      pendingAssets {
        ...DistributionFields
      }
      hrNotifiedCount
      employeeNotified
      emailStatus
      emailError
    }
  }
`;

export async function fetchAssetDistributionsRequest(includeReturned = true) {
  const { data } = await apolloClient.query<{ assetDistributions: DistributionRecordDto[] }>({
    query: distributionsQuery,
    variables: { includeReturned },
    fetchPolicy: "no-cache",
  });

  return data?.assetDistributions ?? [];
}

export async function fetchEmployeeDirectoryRequest(activeOnly = true) {
  const { data } = await apolloClient.query<{
    employeeDirectory: EmployeeDirectoryEntryDto[];
  }>({
    query: employeeDirectoryQuery,
    variables: {
      activeOnly,
    },
    fetchPolicy: "no-cache",
  });

  return data?.employeeDirectory ?? [];
}

export async function fetchAssignmentAcknowledgmentRequest(token: string) {
  const { data } = await apolloClient.query<{
    assignmentAcknowledgment: AssignmentAcknowledgmentPreviewDto;
  }>({
    query: assignmentAcknowledgmentQuery,
    variables: { token },
    fetchPolicy: "no-cache",
  });

  return data?.assignmentAcknowledgment ?? null;
}

export async function fetchAssignmentAcknowledgmentPdfRequest(token: string) {
  const { data } = await apolloClient.query<{
    assignmentAcknowledgmentPdf: AssignmentAcknowledgmentPdfDto;
  }>({
    query: assignmentAcknowledgmentPdfQuery,
    variables: { token },
    fetchPolicy: "no-cache",
  });

  return data?.assignmentAcknowledgmentPdf ?? null;
}

export async function assignAssetDistributionRequest(input: {
  assetId: string;
  employeeId?: string | null;
  employeeName: string;
  recipientRole?: string | null;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{ assignAssetDistribution: DistributionRecordDto }>({
    mutation: assignMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });

  return data?.assignAssetDistribution ?? null;
}

export async function returnAssetDistributionRequest(input: {
  distributionId: string;
  storageLocation?: string | null;
  usageYears?: string | null;
  returnCondition?: string | null;
  returnPower?: string | null;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{ returnAssetDistribution: DistributionRecordDto }>({
    mutation: returnMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });

  return data?.returnAssetDistribution ?? null;
}

export async function sendDistributionNotificationRequest(distributionId: string, message?: string | null) {
  const { data } = await apolloClient.mutate<{ sendDistributionNotification: boolean }>({
    mutation: notifyMutation,
    variables: { distributionId, message: message ?? null },
    fetchPolicy: "no-cache",
  });

  return data?.sendDistributionNotification ?? false;
}

export async function signAssignmentAcknowledgmentRequest(input: {
  token: string;
  signerName: string;
  signatureText: string;
}) {
  const { data } = await apolloClient.mutate<{
    signAssignmentAcknowledgment: SignAssignmentAcknowledgmentResultDto;
  }>({
    mutation: signAcknowledgmentMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });

  return data?.signAssignmentAcknowledgment ?? null;
}

export async function terminateEmployeeAssetsRequest(input: {
  employeeId: string;
  note?: string | null;
}) {
  const { data } = await apolloClient.mutate<{
    terminateEmployeeAssets: TerminationResultDto;
  }>({
    mutation: terminateMutation,
    variables: input,
    fetchPolicy: "no-cache",
  });

  return data?.terminateEmployeeAssets ?? null;
}
