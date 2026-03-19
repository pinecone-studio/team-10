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
  mutation AssignAssetDistribution($assetId: ID!, $employeeName: String!, $recipientRole: String, $note: String) {
    assignAssetDistribution(assetId: $assetId, employeeName: $employeeName, recipientRole: $recipientRole, note: $note) {
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

export async function fetchAssetDistributionsRequest(includeReturned = true) {
  const { data } = await apolloClient.query<{ assetDistributions: DistributionRecordDto[] }>({
    query: distributionsQuery,
    variables: { includeReturned },
    fetchPolicy: "no-cache",
  });

  return data?.assetDistributions ?? [];
}

export async function assignAssetDistributionRequest(input: {
  assetId: string;
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
