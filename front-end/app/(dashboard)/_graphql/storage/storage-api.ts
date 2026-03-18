"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";

export type StorageAssetDto = {
  id: string;
  assetCode: string;
  qrCode: string;
  assetName: string;
  category: string;
  itemType: string;
  serialNumber: string | null;
  conditionStatus: string;
  assetStatus: string;
  storageId: string | null;
  storageName: string;
  storageType: string | null;
  receivedAt: string;
  receiveNote: string | null;
  orderId: string;
  requestNumber: string;
  requestDate: string;
  requester: string;
  department: string;
  unitCost: number | null;
  currencyCode: string;
  createdAt: string;
  updatedAt: string;
};

const storageAssetFields = gql`
  fragment StorageAssetFields on StorageAsset {
    id
    assetCode
    qrCode
    assetName
    category
    itemType
    serialNumber
    conditionStatus
    assetStatus
    storageId
    storageName
    storageType
    receivedAt
    receiveNote
    orderId
    requestNumber
    requestDate
    requester
    department
    unitCost
    currencyCode
    createdAt
    updatedAt
  }
`;

const storageAssetsQuery = gql`
  ${storageAssetFields}

  query StorageAssets {
    storageAssets {
      ...StorageAssetFields
    }
  }
`;

const assetDetailQuery = gql`
  ${storageAssetFields}

  query AssetDetail($id: ID, $qrCode: String) {
    asset(id: $id, qrCode: $qrCode) {
      ...StorageAssetFields
    }
  }
`;

export async function fetchStorageAssetsRequest() {
  const { data } = await apolloClient.query<{ storageAssets: StorageAssetDto[] }>({
    query: storageAssetsQuery,
    fetchPolicy: "no-cache",
  });

  return data?.storageAssets ?? [];
}

export async function fetchStorageAssetDetailRequest(input: {
  id?: string | null;
  qrCode?: string | null;
}) {
  const normalizedId = input.id?.trim() || null;
  const normalizedQrCode = input.qrCode?.trim() || null;

  const { data } = await apolloClient.query<{ asset: StorageAssetDto | null }>({
    query: assetDetailQuery,
    variables: {
      id: normalizedId,
      qrCode: normalizedQrCode,
    },
    fetchPolicy: "no-cache",
  });

  return data?.asset ?? null;
}
