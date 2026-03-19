"use client";

import { gql } from "@apollo/client/core";
import { parseIntakeMetadata } from "@/app/_lib/intake-metadata";
import { apolloClient } from "@/app/providers/apolloClient";
import { fetchOrdersRequest } from "@/app/(dashboard)/_graphql/orders/order-api";

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

function normalizeStorageLoadError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown storage load error.";
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("authentication error")) {
    return "Backend authentication failed while loading storage data. Check the deployed backend Cloudflare/D1 credentials and redeploy the backend.";
  }

  if (
    normalizedMessage.includes("backend_unavailable") ||
    normalizedMessage.includes("could not reach the backend") ||
    normalizedMessage.includes("failed to fetch") ||
    normalizedMessage.includes("network")
  ) {
    return "The frontend could not reach the backend. Check the deployed backend URL and deployment health.";
  }

  if (
    normalizedMessage.includes("service_configuration_error") ||
    normalizedMessage.includes("backend_url_missing") ||
    normalizedMessage.includes("missing required environment variable")
  ) {
    return "The deployed backend is missing required configuration. Check backend environment variables and redeploy.";
  }

  return message;
}

function buildLocalStorageAssets(): Promise<StorageAssetDto[]> {
  return fetchOrdersRequest().then((orders) =>
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

    if ((data?.storageAssets?.length ?? 0) > 0) {
      return data!.storageAssets;
    }

    const fallbackAssets = await buildLocalStorageAssets();
    return fallbackAssets;
  } catch (error) {
    console.warn("Storage assets query failed, trying order-derived fallback.", error);
    try {
      return await buildLocalStorageAssets();
    } catch (fallbackError) {
      throw new Error(normalizeStorageLoadError(fallbackError));
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
