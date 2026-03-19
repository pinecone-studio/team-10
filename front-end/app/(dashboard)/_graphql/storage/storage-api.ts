"use client";

import { gql } from "@apollo/client/core";
import { apolloClient } from "@/app/providers/apolloClient";
import { loadOrdersSnapshot } from "@/app/_lib/order-store";

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

function inferStorageCategory(itemName: string) {
  const normalized = itemName.toLowerCase();

  if (
    normalized.includes("macbook") ||
    normalized.includes("keyboard") ||
    normalized.includes("mouse") ||
    normalized.includes("laptop")
  ) {
    return "IT Equipment";
  }

  if (normalized.includes("basketball") || normalized.includes("ball")) {
    return "Other Assets";
  }

  return "Other Assets";
}

function buildLocalStorageAssets(): Promise<StorageAssetDto[]> {
  return loadOrdersSnapshot().then((orders) =>
    orders
      .filter((order) => order.status === "received_inventory" || order.status === "assigned_hr")
      .flatMap((order) =>
        order.items.flatMap((item, itemIndex) => {
          const assetStartIndex = order.items
            .slice(0, itemIndex)
            .reduce((sum, previousItem) => sum + previousItem.quantity, 0);
          const serialNumbers =
            order.serialNumbers.length > 0
              ? order.serialNumbers
              : Array.from(
                  { length: item.quantity },
                  (_, serialIndex) => `${item.code}-${String(serialIndex + 1).padStart(3, "0")}`,
                );

          return Array.from({ length: item.quantity }, (_, assetIndex) => {
            const absoluteAssetIndex = assetStartIndex + assetIndex;
            const assetCode =
              order.assetIds[absoluteAssetIndex] ??
              `${item.code}-${String(assetIndex + 1).padStart(3, "0")}`;
            const serialNumber =
              serialNumbers[absoluteAssetIndex] ??
              `${item.code}-${String(assetIndex + 1).padStart(3, "0")}`;
            const receivedAt = order.receivedAt ?? order.updatedAt;

            return {
              id: `${order.id}-storage-${itemIndex}-${assetIndex}`,
              assetCode,
              qrCode: `QR-${order.id}-${item.code}-${serialNumber}`,
              assetName: item.name,
              category: inferStorageCategory(item.name),
              itemType: "Inventory Item",
              serialNumber,
              conditionStatus: order.receivedCondition === "issue" ? "damaged" : "good",
              assetStatus: "inStorage",
              storageId: "local-storage",
              storageName: order.storageLocation || "Main warehouse / Intake",
              storageType: "warehouse",
              receivedAt,
              receiveNote: order.receivedNote || null,
              orderId: order.id,
              requestNumber: order.requestNumber,
              requestDate: order.requestDate,
              requester: order.requester,
              department: order.department,
              unitCost: item.unitPrice,
              currencyCode: item.currencyCode,
              createdAt: order.createdAt,
              updatedAt: order.updatedAt,
            } satisfies StorageAssetDto;
          });
        }),
      ),
  );
}

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
  try {
    const { data } = await apolloClient.query<{ storageAssets: StorageAssetDto[] }>({
      query: storageAssetsQuery,
      fetchPolicy: "no-cache",
    });

    return data?.storageAssets ?? [];
  } catch (error) {
    console.warn("Falling back to local storage assets.", error);
    return buildLocalStorageAssets();
  }
}

export async function fetchStorageAssetDetailRequest(input: {
  id?: string | null;
  qrCode?: string | null;
}) {
  const normalizedId = input.id?.trim() || null;
  const normalizedQrCode = input.qrCode?.trim() || null;
  try {
    const { data } = await apolloClient.query<{ asset: StorageAssetDto | null }>({
      query: assetDetailQuery,
      variables: {
        id: normalizedId,
        qrCode: normalizedQrCode,
      },
      fetchPolicy: "no-cache",
    });

    return data?.asset ?? null;
  } catch (error) {
    console.warn("Falling back to local storage asset detail.", error);
    const localAssets = await buildLocalStorageAssets();
    return (
      localAssets.find(
        (asset) =>
          (normalizedId && asset.id === normalizedId) ||
          (normalizedQrCode && asset.qrCode === normalizedQrCode),
      ) ?? null
    );
  }
}
