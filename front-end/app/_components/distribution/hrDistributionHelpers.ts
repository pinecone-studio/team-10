import type { DistributionRecordDto } from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import type { StorageAssetDto } from "@/app/(dashboard)/_graphql/storage/storage-api";

export type RetrievalDraft = {
  years: string;
  condition: string;
  power: string;
  notes: string;
};

export type DistributionSession = {
  holder: string;
  role: string;
  assignedAt: string;
  years: string;
  condition: string;
  power: string;
  notes: string;
  returnedAt: string;
};

export type DistributionItem = {
  id: string;
  distributionId: string | null;
  assetName: string;
  assetCode: string;
  serialNumber: string | null;
  receivedAt: string;
  storageName: string;
  conditionStatus: string;
  category: string;
  itemType: string;
  holder: string | null;
  role: string | null;
  sessions: DistributionSession[];
};

export function draftFor(value?: RetrievalDraft): RetrievalDraft {
  return value ?? { years: "", condition: "Okay", power: "Working", notes: "" };
}

function toSession(record: DistributionRecordDto): DistributionSession {
  return {
    holder: record.employeeName,
    role: record.recipientRole || "Employee",
    assignedAt: record.distributedAt,
    years: record.usageYears || "-",
    condition: record.returnCondition || "-",
    power: record.returnPower || "-",
    notes: record.note || "No notes",
    returnedAt: record.returnedAt || "-",
  };
}

export function buildHistoryMap(records: DistributionRecordDto[]) {
  return records.reduce<Record<string, DistributionSession[]>>((acc, record) => {
    acc[record.assetId] = [...(acc[record.assetId] ?? []), toSession(record)];
    return acc;
  }, {});
}

export function matchesAssetQuery(
  item: Pick<DistributionItem, "assetName" | "assetCode" | "serialNumber" | "storageName" | "category" | "itemType">,
  searchValue: string,
) {
  const query = searchValue.trim().toLowerCase();
  if (!query) return true;
  return [
    item.assetName,
    item.assetCode,
    item.serialNumber ?? "",
    item.storageName,
    item.category,
    item.itemType,
  ].some((value) => value.toLowerCase().includes(query));
}

export function buildAvailableItems(storageAssets: StorageAssetDto[], historyMap: Record<string, DistributionSession[]>) {
  return storageAssets.map<DistributionItem>((asset) => ({
    id: asset.id,
    distributionId: null,
    assetName: asset.assetName,
    assetCode: asset.assetCode,
    serialNumber: asset.serialNumber,
    receivedAt: asset.receivedAt,
    storageName: asset.storageName,
    conditionStatus: asset.conditionStatus,
    category: asset.category,
    itemType: asset.itemType,
    holder: null,
    role: null,
    sessions: historyMap[asset.id] ?? [],
  }));
}

export function buildAssignedItems(records: DistributionRecordDto[]) {
  return records
    .filter((record) => record.status === "active")
    .map<DistributionItem>((record) => ({
      id: record.assetId,
      distributionId: record.id,
      assetName: record.assetName,
      assetCode: record.assetCode,
      serialNumber: record.serialNumber,
      receivedAt: record.distributedAt,
      storageName: record.currentStorageName ?? "Assigned out",
      conditionStatus: record.conditionStatus,
      category: record.category,
      itemType: record.itemType,
      holder: record.employeeName,
      role: record.recipientRole,
      sessions: [],
    }));
}
