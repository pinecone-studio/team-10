"use client";

import { gql } from "@apollo/client/core";
import { parseIntakeMetadata } from "@/app/_lib/intake-metadata";
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
  assetImageDataUrl: string | null;
  conditionStatus: string;
  assetStatus: string;
  assignedEmployeeName: string | null;
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

export type AssetLabelPdfDto = {
  fileName: string;
  contentType: string;
  base64: string;
  assetCount: number;
};

function wait(durationMs: number) {
  return new Promise((resolve) => setTimeout(resolve, durationMs));
}

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
            const intakeMetadata = parseIntakeMetadata(order.receivedNote);

            return {
              id: `${order.id}-storage-${itemIndex}-${assetIndex}`,
              assetCode,
              qrCode: `QR-${assetCode}-${serialNumber}`,
              assetName: item.name,
              category: intakeMetadata.category || inferStorageCategory(item.name),
              itemType: intakeMetadata.itemType || "Inventory Item",
              serialNumber,
              assetImageDataUrl: order.receivedImageDataUrl ?? null,
              conditionStatus: order.receivedCondition === "issue" ? "damaged" : "good",
              assetStatus: "inStorage",
              assignedEmployeeName: null,
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

async function findLocalStorageAssetDetail(input: {
  id?: string | null;
  qrCode?: string | null;
}) {
  const normalizedId = input.id?.trim() || null;
  const normalizedQrCode = input.qrCode?.trim() || null;
  const localAssets = await buildLocalStorageAssets();

  return (
    localAssets.find(
      (asset) =>
        (normalizedId &&
          (asset.id === normalizedId || asset.assetCode === normalizedId)) ||
        (normalizedQrCode && asset.qrCode === normalizedQrCode),
    ) ?? null
  );
}

function shouldUseLocalStorageAssetFallback(input: {
  id?: string | null;
  qrCode?: string | null;
}) {
  const normalizedId = input.id?.trim() || "";
  const normalizedQrCode = input.qrCode?.trim() || "";

  if (normalizedId && !/^\d+$/.test(normalizedId)) {
    return true;
  }

  if (normalizedQrCode.startsWith("QR-local-")) {
    return true;
  }

  return false;
}

const storageAssetListFields = gql`
  fragment StorageAssetListFields on StorageAsset {
    id
    assetCode
    qrCode
    assetName
    category
    itemType
    serialNumber
    assetImageDataUrl
    conditionStatus
    assetStatus
    assignedEmployeeName
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

const storageAssetDetailFields = gql`
  fragment StorageAssetDetailFields on StorageAsset {
    id
    assetCode
    qrCode
    assetName
    category
    itemType
    serialNumber
    assetImageDataUrl
    conditionStatus
    assetStatus
    assignedEmployeeName
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
  ${storageAssetListFields}

  query StorageAssets {
    storageAssets {
      ...StorageAssetListFields
    }
  }
`;

const storageLocationsQuery = gql`
  query StorageLocations {
    storageLocations
  }
`;

const storageLocationsFallbackQuery = gql`
  query StorageLocationsFallback {
    storageAssets {
      storageName
    }
  }
`;

const assetDetailQuery = gql`
  ${storageAssetDetailFields}

  query AssetDetail($id: ID, $qrCode: String) {
    asset(id: $id, qrCode: $qrCode) {
      ...StorageAssetDetailFields
    }
  }
`;

const assetLabelPdfQuery = gql`
  query AssetLabelPdf($assetCodes: [String!]!) {
    assetLabelPdf(assetCodes: $assetCodes) {
      fileName
      contentType
      base64
      assetCount
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
  } catch (firstError) {
    await wait(350);
    const { data } = await apolloClient.query<{ storageAssets: StorageAssetDto[] }>({
      query: storageAssetsQuery,
      fetchPolicy: "no-cache",
    });

    if (!data?.storageAssets) {
      throw firstError instanceof Error
        ? firstError
        : new Error("Failed to load storage assets.");
    }

    return data.storageAssets;
  }
}

export async function fetchStorageLocationsRequest() {
  try {
    const { data } = await apolloClient.query<{ storageLocations: string[] }>({
      query: storageLocationsQuery,
      fetchPolicy: "no-cache",
    });

    return data?.storageLocations ?? [];
  } catch (error) {
    console.warn("Storage location list request failed. Trying storageAssets fallback.", error);
    try {
      const { data } = await apolloClient.query<{
        storageAssets: Array<{ storageName: string | null }>;
      }>({
        query: storageLocationsFallbackQuery,
        fetchPolicy: "no-cache",
      });

      const locations = new Set<string>();
      for (const asset of data?.storageAssets ?? []) {
        const storageName = asset.storageName?.trim();
        if (storageName) {
          locations.add(storageName);
        }
      }

      return [...locations];
    } catch (fallbackError) {
      console.warn(
        "Storage location fallback request failed. Using empty location list.",
        fallbackError,
      );
      return [];
    }
  }
}

export async function fetchStorageAssetDetailRequest(input: {
  id?: string | null;
  qrCode?: string | null;
}) {
  const normalizedId = input.id?.trim() || null;
  const normalizedQrCode = input.qrCode?.trim() || null;
  const allowLocalFallback = shouldUseLocalStorageAssetFallback({
    id: normalizedId,
    qrCode: normalizedQrCode,
  });
  try {
    const { data } = await apolloClient.query<{ asset: StorageAssetDto | null }>({
      query: assetDetailQuery,
      variables: {
        id: normalizedId,
        qrCode: normalizedQrCode,
      },
      fetchPolicy: "no-cache",
    });

    if (data?.asset) {
      return data.asset;
    }

    return allowLocalFallback
      ? findLocalStorageAssetDetail({
          id: normalizedId,
          qrCode: normalizedQrCode,
        })
      : null;
  } catch (error) {
    console.warn("Falling back to local storage asset detail.", error);
    if (!allowLocalFallback) {
      throw error instanceof Error
        ? error
        : new Error("Failed to load storage asset detail.");
    }
    return findLocalStorageAssetDetail({
      id: normalizedId,
      qrCode: normalizedQrCode,
    });
  }
}

export async function downloadAssetLabelsPdfRequest(assetCodes: string[]) {
  const normalizedAssetCodes = assetCodes.map((assetCode) => assetCode.trim()).filter(Boolean);

  if (normalizedAssetCodes.length === 0) {
    throw new Error("Select at least one asset to print labels.");
  }

  const { data } = await apolloClient.query<{ assetLabelPdf: AssetLabelPdfDto }>({
    query: assetLabelPdfQuery,
    variables: { assetCodes: normalizedAssetCodes },
    fetchPolicy: "no-cache",
  });

  if (!data?.assetLabelPdf) {
    throw new Error("Asset label PDF did not return any data.");
  }

  return data.assetLabelPdf;
}

const updateStorageAssetMutation = gql`
  ${storageAssetDetailFields}

  mutation UpdateStorageAsset(
    $id: ID!
    $assetStatus: String
    $conditionStatus: String
  ) {
    updateStorageAsset(
      id: $id
      assetStatus: $assetStatus
      conditionStatus: $conditionStatus
    ) {
      ...StorageAssetDetailFields
    }
  }
`;

export async function updateStorageAssetRequest(input: {
  id: string;
  assetStatus?: string | null;
  conditionStatus?: string | null;
}) {
  try {
    const result = await apolloClient.mutate<{
      updateStorageAsset: StorageAssetDto;
    }>({
      mutation: updateStorageAssetMutation,
      variables: {
        id: input.id,
        assetStatus: input.assetStatus ?? null,
        conditionStatus: input.conditionStatus ?? null,
      },
    });

    if (result.error) {
      throw result.error;
    }

    const { data } = result;
    if (!data?.updateStorageAsset) {
      throw new Error("Asset update did not return a record.");
    }

    return data.updateStorageAsset;
  } catch (error) {
    console.warn("Falling back to local storage asset update.", error);
    const localAssets = await buildLocalStorageAssets();
    const existingAsset = localAssets.find((asset) => asset.id === input.id);

    if (!existingAsset) {
      throw error instanceof Error ? error : new Error("Asset was not found.");
    }

    return {
      ...existingAsset,
      assetStatus: input.assetStatus ?? existingAsset.assetStatus,
      conditionStatus: input.conditionStatus ?? existingAsset.conditionStatus,
      updatedAt: new Date().toISOString(),
    };
  }
}
