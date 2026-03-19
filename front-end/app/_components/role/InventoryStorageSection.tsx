"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchStorageAssetDetailRequest,
  fetchStorageAssetsRequest,
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";

const ACTIONS = ["Dispose", "Census", "Missing", "Audit"] as const;
const CATEGORIES = [
  "All Categories",
  "IT Equipment",
  "Office Equipment",
  "Mobile Devices",
  "Network Equipment",
  "Furniture",
  "Other Assets",
] as const;
const GRID =
  "grid grid-cols-[42px_96px_1.45fr_112px_150px_122px_108px_108px_110px_48px]";

export function InventoryStorageSection() {
  const [assets, setAssets] = useState<StorageAssetDto[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<StorageAssetDto | null>(null);
  const [lookupValue, setLookupValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortMode, setSortMode] = useState<"recent" | "name" | "cost_desc">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextAssets = await fetchStorageAssetsRequest();
        if (!isMounted) return;

        setAssets(nextAssets);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load storage assets.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedAssetId) {
      setSelectedAsset(null);
      return;
    }

    let isMounted = true;

    void (async () => {
      setIsDetailLoading(true);
      setErrorMessage(null);

      try {
        const detail = await fetchStorageAssetDetailRequest({ id: selectedAssetId });
        if (!isMounted) return;
        setSelectedAsset(detail);
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to load asset detail.",
        );
      } finally {
        if (isMounted) {
          setIsDetailLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [selectedAssetId]);

  const searchedAssets = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    if (!normalizedQuery) return assets;

    return assets.filter((asset) =>
      [
        asset.id,
        asset.assetCode,
        asset.assetName,
        asset.requestNumber,
        asset.requester,
        asset.department,
        asset.category,
        asset.itemType,
        asset.storageName,
        asset.serialNumber ?? "",
        asset.qrCode,
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [assets, searchValue]);

  const categoryCounts = useMemo(
    () =>
      CATEGORIES.map((category) => ({
        category,
        count:
          category === "All Categories"
            ? searchedAssets.length
            : searchedAssets.filter((asset) => mapCategory(asset.category) === category).length,
      })),
    [searchedAssets],
  );

  const typeOptions = useMemo(() => {
    const categoryScopedAssets =
      selectedCategory === "All Categories"
        ? searchedAssets
        : searchedAssets.filter((asset) => mapCategory(asset.category) === selectedCategory);

    return [
      "All Types",
      ...new Set(
        categoryScopedAssets
          .map((asset) => normalizeItemType(asset.itemType))
          .filter(Boolean),
      ),
    ];
  }, [searchedAssets, selectedCategory]);

  const visibleAssets = useMemo(() => {
    const categoryFilteredAssets =
      selectedCategory === "All Categories"
        ? searchedAssets
        : searchedAssets.filter((asset) => mapCategory(asset.category) === selectedCategory);
    const typeFilteredAssets =
      selectedType === "All Types"
        ? categoryFilteredAssets
        : categoryFilteredAssets.filter(
            (asset) => normalizeItemType(asset.itemType) === selectedType,
          );

    return [...typeFilteredAssets].sort((left, right) => {
      if (sortMode === "name") {
        return left.assetName.localeCompare(right.assetName);
      }

      if (sortMode === "cost_desc") {
        return (right.unitCost ?? 0) - (left.unitCost ?? 0);
      }

      return right.receivedAt.localeCompare(left.receivedAt);
    });
  }, [searchedAssets, selectedCategory, selectedType, sortMode]);

  const typeBreakdown = useMemo(
    () =>
      Array.from(
        visibleAssets.reduce((accumulator, asset) => {
          const key = normalizeItemType(asset.itemType) || "Unclassified";
          accumulator.set(key, (accumulator.get(key) ?? 0) + 1);
          return accumulator;
        }, new Map<string, number>()),
      )
        .map(([type, count]) => ({ type, count }))
        .sort((left, right) => right.count - left.count)
        .slice(0, 6),
    [visibleAssets],
  );

  async function handleLookupSubmit() {
    const value = lookupValue.trim();
    if (!value) return;

    setIsDetailLoading(true);
    setErrorMessage(null);

    try {
      const detail = await fetchStorageAssetDetailRequest({
        id: /^\d+$/.test(value) ? value : null,
        qrCode: /^\d+$/.test(value) ? null : value,
      });

      if (!detail) {
        setErrorMessage("No asset matched that asset ID or QR code.");
        return;
      }

      setSelectedAsset(detail);
      setSelectedAssetId(detail.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to look up asset detail.",
      );
    } finally {
      setIsDetailLoading(false);
    }
  }

  if (selectedAsset) {
    return (
      <WorkspaceShell
        title="Storage"
        subtitle="Audit and control received inventory."
        backgroundClassName="bg-[linear-gradient(180deg,#e8f3ff_0%,#f7fbff_56%,#ffffff_100%)]"
      >
        <button
          type="button"
          onClick={() => {
            setSelectedAsset(null);
            setSelectedAssetId(null);
          }}
          className="mb-4 text-[14px] font-medium text-[#334155]"
        >
          {"<-"} Back to Storage Assets
        </button>
        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.65fr]">
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">
              Asset Detail
            </div>
            <div className="space-y-4 p-5">
              <div className="rounded-[14px] bg-[#eef5fc] p-4">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-white text-[24px]">
                    QR
                  </div>
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-[linear-gradient(135deg,#35a7ff_0%,#2563eb_52%,#8cd8ff_100%)] px-4 text-center text-[15px] font-semibold text-white">
                    {selectedAsset.assetName}
                  </div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#475569]">
                  {selectedAsset.receiveNote ||
                    "Received inventory item now tracked from backend asset and storage records."}
                </p>
              </div>
              <div className="divide-y divide-[#e8eef5] rounded-[12px] border border-[#e6edf5] bg-[#fcfdff]">
                {[
                  ["Asset ID", selectedAsset.id],
                  ["Asset Code", selectedAsset.assetCode],
                  ["Asset Name", selectedAsset.assetName],
                  ["Department", selectedAsset.department],
                  ["Category", mapCategory(selectedAsset.category)],
                  ["Type", normalizeItemType(selectedAsset.itemType) || "-"],
                  ["Location", selectedAsset.storageName],
                  ["Condition", formatCondition(selectedAsset.conditionStatus)],
                  [
                    "Unit Cost",
                    formatCurrency(
                      selectedAsset.unitCost ?? 0,
                      parseCurrency(selectedAsset.currencyCode),
                    ),
                  ],
                  [
                    "Assigned",
                    isAssignedStatus(selectedAsset.assetStatus) ? "Yes" : "No",
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between px-4 py-3 text-[13px]"
                  >
                    <span className="text-[#64748b]">{label}</span>
                    <span className="font-medium text-[#111827]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">
              Asset QR Detail
            </div>
            <div className="space-y-5 p-5">
              <div className="flex flex-wrap gap-2">
                <div className="fx-group min-w-[260px] flex-1" data-filled={lookupValue ? "true" : "false"}>
                  <input
                    value={lookupValue}
                    onChange={(event) => setLookupValue(event.target.value)}
                    className="fx-input"
                  />
                  <span className="fx-highlight" />
                  <span className="fx-bar" />
                  <span className="fx-label">Enter asset ID or QR-...</span>
                </div>
                <button
                  type="button"
                  onClick={() => void handleLookupSubmit()}
                  className="fx-submit-button h-10 px-4 text-[12px] font-medium"
                >
                  <span className="fx-submit-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="fx-submit-icon"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                  <span className="fx-submit-label">
                    {isDetailLoading ? "Looking up..." : "Find"}
                  </span>
                </button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Request ID" value={selectedAsset.requestNumber} />
                <Field
                  label="Request Date"
                  value={formatDisplayDate(selectedAsset.requestDate)}
                />
                <Field label="Stored At" value={selectedAsset.storageName} />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Category" value={mapCategory(selectedAsset.category)} />
                <Field
                  label="Type"
                  value={normalizeItemType(selectedAsset.itemType) || "-"}
                />
              </div>
              <div className="rounded-[14px] border border-[#e4ebf3] bg-white px-4 py-4 text-[13px] text-[#475569]">
                <div className="flex justify-between">
                  <span>Requester</span>
                  <span>{selectedAsset.requester || "-"}</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span>Serial Number</span>
                  <span>{selectedAsset.serialNumber || "-"}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-[#edf2f7] pt-3 text-[20px] font-semibold text-[#111827]">
                  <span>QR Code</span>
                  <span className="max-w-[70%] truncate text-right">
                    {selectedAsset.qrCode}
                  </span>
                </div>
              </div>
              <QrCard title={selectedAsset.assetCode} value={selectedAsset.qrCode} />
            </div>
          </section>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title="Storage Assets"
      subtitle="Manage your inventory stock levels"
      backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]"
    >
      {errorMessage ? (
        <EmptyState title="Storage data unavailable" description={errorMessage} />
      ) : isLoading ? (
        <StorageLoadingState />
      ) : assets.length === 0 ? (
        <EmptyState
          title="No stored goods yet"
          description="Received items will appear here right after the receive step."
        />
      ) : (
        <div className="overflow-hidden rounded-[20px] border border-[#d7e5f3] bg-white shadow-[0_18px_42px_rgba(148,163,184,0.14)]">
          <div className="bg-[linear-gradient(180deg,#cfe3fb_0%,#d9ebff_26%,#eef6ff_68%,#ffffff_100%)] px-6 pb-5 pt-6">
            <div className="flex flex-wrap gap-2">
              <div className="fx-group min-w-[260px] flex-1" data-filled={searchValue ? "true" : "false"}>
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  className="fx-input"
                />
                <span className="fx-highlight" />
                <span className="fx-bar" />
                <span className="fx-label">
                  Search by QR, asset, category, type, requester, or department...
                </span>
              </div>
              {ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="fx-submit-button h-10 px-4 text-[12px] font-medium"
                >
                  <span className="fx-submit-icon-wrapper">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="fx-submit-icon"
                    >
                      <path d="M12 5v14" />
                      <path d="M5 12h14" />
                    </svg>
                  </span>
                  <span className="fx-submit-label">{action}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
                className="h-10 min-w-[180px] rounded-[10px] border border-[#dbe8f5] bg-white px-3 text-[13px] text-[#334155] shadow-[0_4px_12px_rgba(148,163,184,0.08)]"
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <select
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as typeof sortMode)}
                className="h-10 min-w-[180px] rounded-[10px] border border-[#dbe8f5] bg-white px-3 text-[13px] text-[#334155] shadow-[0_4px_12px_rgba(148,163,184,0.08)]"
              >
                <option value="recent">Sort: Latest received</option>
                <option value="name">Sort: Asset name</option>
                <option value="cost_desc">Sort: Highest cost</option>
              </select>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {categoryCounts.map(({ category, count }) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedType("All Types");
                  }}
                  className={`min-w-[148px] rounded-[14px] border px-3 py-3 text-left shadow-[0_4px_12px_rgba(148,163,184,0.10)] ${
                    selectedCategory === category
                      ? "border-[#93c5fd] bg-[linear-gradient(135deg,#eaf3ff_0%,#f9fbff_100%)]"
                      : "border-[#dbe8f5] bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_100%)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold leading-5 text-[#334155]">
                        {category}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#64748b]">
                        {category === "All Categories" ? "All assets" : "Filter"}
                      </p>
                    </div>
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[rgba(37,99,235,0.12)] px-2 text-[11px] font-medium text-[#2563eb]">
                      {count}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {typeBreakdown.length > 0 ? (
                typeBreakdown.map(({ type, count }) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] ${
                      selectedType === type
                        ? "border-[#93c5fd] bg-white text-[#1d4ed8]"
                        : "border-[#dbe3ee] bg-[#f8fbff] text-[#475569]"
                    }`}
                  >
                    <span>{type}</span>
                    <span className="rounded-full bg-[rgba(37,99,235,0.10)] px-2 py-[1px] text-[11px] text-[#2563eb]">
                      {count}
                    </span>
                  </button>
                ))
              ) : (
                <span className="text-[12px] text-[#64748b]">
                  No type breakdown available for this selection.
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-[#64748b]">
              <span>
                Showing {visibleAssets.length} asset{visibleAssets.length === 1 ? "" : "s"}
              </span>
              <span>
                {selectedCategory === "All Categories"
                  ? "All categories"
                  : `${selectedCategory}${selectedType === "All Types" ? "" : ` / ${selectedType}`}`}
              </span>
            </div>
          </div>
          <div className="space-y-4 px-4 pb-3">
            <div
              className={`${GRID} items-center rounded-[12px] border border-[#e7edf4] bg-[#dfeeff] px-3 py-3 text-[11px] font-medium text-[#334155]`}
            >
              <span>No</span>
              <span>ID</span>
              <span>Asset Name</span>
              <span>Date</span>
              <span>Category / Type</span>
              <span>Location</span>
              <span>Condition</span>
              <span>Status</span>
              <span>Unit Cost</span>
              <span />
            </div>
            <div className="overflow-hidden rounded-[14px] border border-[#dbe7f3] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.10)]">
              {visibleAssets.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-[16px] font-semibold text-[#0f172a]">
                    No assets in this selection
                  </p>
                  <p className="mt-2 text-[13px] text-[#64748b]">
                    {selectedCategory === "All Categories"
                      ? "Try another search or type filter."
                      : `No stored items match ${selectedCategory}${selectedType === "All Types" ? "" : ` / ${selectedType}`}.`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#edf2f7]">
                  {visibleAssets.map((asset, index) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`${GRID} w-full items-center px-3 py-3 text-left text-[11px] text-[#334155] hover:bg-[#f8fbff]`}
                    >
                      <span>{index + 1}</span>
                      <span>{asset.id}</span>
                      <span>
                        <span className="block font-medium text-[#111827]">
                          {asset.assetName}
                        </span>
                        <span className="mt-1 block text-[#94a3b8]">
                          {asset.requestNumber}
                        </span>
                      </span>
                      <span>{formatDisplayDate(asset.receivedAt)}</span>
                      <span>
                        <span className="inline-flex rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-2 py-[2px] text-[10px]">
                          {mapCategory(asset.category)}
                        </span>
                        <span className="mt-1 block text-[10px] text-[#64748b]">
                          {normalizeItemType(asset.itemType) || "Unclassified"}
                        </span>
                      </span>
                      <span>{asset.storageName}</span>
                      <span>
                        <ToneBadge
                          tone={asset.conditionStatus === "damaged" ? "warning" : "success"}
                        >
                          {formatCondition(asset.conditionStatus)}
                        </ToneBadge>
                      </span>
                      <span>
                        <ToneBadge
                          tone={isAssignedStatus(asset.assetStatus) ? "info" : "neutral"}
                        >
                          {formatAssetStatus(asset.assetStatus)}
                        </ToneBadge>
                      </span>
                      <span>
                        {formatCurrency(
                          asset.unitCost ?? 0,
                          parseCurrency(asset.currencyCode),
                        )}
                      </span>
                      <span className="text-right text-[16px] text-[#94a3b8]">...</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between px-1 pt-3 text-[10px] text-[#64748b]">
              <span>0 of {visibleAssets.length} row(s) selected.</span>
              <div className="flex items-center gap-4">
                <span>Rows per page 10</span>
                <span>Page 1 of 1</span>
                <span>{"< < > >"}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

function mapCategory(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("it")) return "IT Equipment";
  if (normalized.includes("office")) return "Office Equipment";
  if (normalized.includes("mobile")) return "Mobile Devices";
  if (normalized.includes("network")) return "Network Equipment";
  if (normalized.includes("furniture")) return "Furniture";

  return "Other Assets";
}

function normalizeItemType(value: string) {
  return value.trim();
}

function parseCurrency(value: string) {
  if (value === "USD" || value === "EUR" || value === "MNT") {
    return value;
  }

  return "MNT";
}

function formatCondition(value: string) {
  if (value === "damaged") return "Damaged";
  if (value === "defective") return "Defective";
  if (value === "fair") return "Fair";
  if (value === "incomplete") return "Incomplete";
  if (value === "used") return "Used";

  return "Good";
}

function isAssignedStatus(value: string) {
  return value === "assigned" || value === "pendingAssignment";
}

function formatAssetStatus(value: string) {
  if (value === "pendingAssignment") return "Pending Assignment";
  if (value === "assigned") return "Assigned";
  if (value === "available") return "Available";
  if (value === "received") return "Received";
  if (value === "inStorage") return "Available";

  return value;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#d9e5f2] bg-white px-3 py-3">
      <p className="text-[11px] text-[#94a3b8]">{label}</p>
      <p className="mt-1 text-[13px] text-[#111827]">{value}</p>
    </div>
  );
}

function ToneBadge({
  children,
  tone,
}: {
  children: string;
  tone: "success" | "warning" | "info" | "neutral";
}) {
  const styles =
    tone === "success"
      ? "border-[#bbf7d0] bg-[#effdf3] text-[#15803d]"
      : tone === "warning"
        ? "border-[#fde68a] bg-[#fff7e8] text-[#d97706]"
        : tone === "info"
          ? "border-[#bfdbfe] bg-[#eef4ff] text-[#2563eb]"
          : "border-[#dbe4ee] bg-[#f8fafc] text-[#64748b]";

  return (
    <span className={`inline-flex rounded-full border px-2 py-[2px] text-[10px] ${styles}`}>
      {children}
    </span>
  );
}

function QrCard({ title, value }: { title: string; value: string }) {
  const cells = Array.from(
    { length: 81 },
    (_, index) => ((value.charCodeAt(index % value.length) || 0) + index) % 2 === 0,
  );

  return (
    <div className="rounded-[12px] border border-[#dbe3ee] bg-white p-3">
      <div className="grid grid-cols-9 gap-px rounded-[8px] bg-[#f8fbff] p-2">
        {cells.map((filled, index) => (
          <span
            key={`${value}-${index}`}
            className={`h-3 w-3 rounded-[1px] ${filled ? "bg-[#0f172a]" : "bg-[#dbeafe]"}`}
          />
        ))}
      </div>
      <p className="mt-2 truncate text-[11px] font-medium text-[#111827]">{title}</p>
      <p className="mt-1 truncate text-[10px] text-[#64748b]">{value}</p>
    </div>
  );
}

function StorageLoadingState() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-6 rounded-[18px] border border-dashed border-[#d9e9f9] bg-white/80 px-6 py-10 text-center">
      <div className="inventory-loader" aria-hidden="true">
        <div className="inventory-loader-ground">
          <div />
        </div>
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`inventory-loader-box inventory-loader-box${index}`}>
            <div />
          </div>
        ))}
      </div>
      <div>
        <p className="text-[18px] font-semibold text-[#0f172a]">Loading storage assets</p>
        <p className="mt-2 max-w-[360px] text-[13px] text-[#64748b]">
          Pulling live asset and storage records from the backend.
        </p>
      </div>
    </div>
  );
}
