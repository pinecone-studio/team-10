"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  fetchStorageAssetsRequest,
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import {
  StorageCheckbox,
  StorageConditionBadge,
  StorageStatusBadge,
} from "./storagePresentation";

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

type StorageWorkspaceView = "assets" | "census";

type CensusSession = {
  id: string;
  title: string;
  location: string;
  scope: "selected" | "location" | "full";
  status: "draft" | "active" | "completed";
  assetCount: number;
  createdAt: string;
  startedAt: string;
  dueAt: string;
  completedAt: string | null;
  progressCount: number;
  owner: string;
  note: string;
};

export function InventoryStorageSection() {
  const [assets, setAssets] = useState<StorageAssetDto[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof CATEGORIES)[number]>("All Categories");
  const [selectedType, setSelectedType] = useState("All Types");
  const [sortMode, setSortMode] = useState<"recent" | "name" | "cost_desc">("recent");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setView] = useState<StorageWorkspaceView>("assets");
  const [censusTitle, setCensusTitle] = useState("");
  const [censusLocation, setCensusLocation] = useState("Main warehouse / Intake");
  const [censusScope, setCensusScope] = useState<"selected" | "location" | "full">("selected");
  const [censusNote, setCensusNote] = useState("");
  const [currentSession, setCurrentSession] = useState<CensusSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CensusSession[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const nextAssets = await fetchStorageAssetsRequest();
        if (!isMounted) return;
        setAssets(nextAssets);
        setSessionHistory(createInitialCensusHistory(nextAssets));
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load storage assets.",
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

  const currentRole =
    pathname.split("/").filter(Boolean)[0] === "systemAdmin" ? "systemAdmin" : "inventoryHead";
  const allVisibleSelected =
    visibleAssets.length > 0 && visibleAssets.every((asset) => selectedIds.includes(asset.id));
  const selectedAssets = assets.filter((asset) => selectedIds.includes(asset.id));
  const scopedAssetCount =
    censusScope === "selected"
      ? selectedAssets.length
      : censusScope === "location"
        ? assets.filter((asset) => asset.storageName === censusLocation).length
        : assets.length;

  function handleActionClick(action: (typeof ACTIONS)[number]) {
    if (action === "Census") {
      setView("census");
    }
  }

  function handleCreateCensus() {
    const now = new Date();
    const assetCount = Math.max(scopedAssetCount, 0);
    const nextSession: CensusSession = {
      id: `CNS-${now.getFullYear()}-${String(sessionHistory.length + 1).padStart(3, "0")}`,
      title:
        censusTitle.trim() ||
        `${censusLocation} ${censusScope === "selected" ? "selected assets" : "census"}`,
      location: censusLocation,
      scope: censusScope,
      status: "active",
      assetCount,
      createdAt: now.toISOString(),
      startedAt: now.toISOString(),
      dueAt: new Date(now.getTime() + 1000 * 60 * 60 * 24).toISOString(),
      completedAt: null,
      progressCount: censusScope === "selected" ? selectedAssets.length : 0,
      owner: "Batbayar Dorj",
      note: censusNote.trim(),
    };

    setCurrentSession(nextSession);
    setCensusTitle("");
    setCensusNote("");
  }

  function handleCompleteCurrentSession() {
    if (!currentSession) return;

    const completedSession: CensusSession = {
      ...currentSession,
      status: "completed",
      progressCount: currentSession.assetCount,
      completedAt: new Date().toISOString(),
    };

    setSessionHistory((current) => [completedSession, ...current]);
    setCurrentSession(null);
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
      ) : view === "census" ? (
        <StorageCensusWorkspace
          selectedCount={selectedIds.length}
          currentSession={currentSession}
          history={sessionHistory}
          censusTitle={censusTitle}
          censusLocation={censusLocation}
          censusScope={censusScope}
          censusNote={censusNote}
          scopedAssetCount={scopedAssetCount}
          availableLocations={Array.from(new Set(assets.map((asset) => asset.storageName)))}
          onBack={() => setView("assets")}
          onTitleChange={setCensusTitle}
          onLocationChange={setCensusLocation}
          onScopeChange={setCensusScope}
          onNoteChange={setCensusNote}
          onCreate={handleCreateCensus}
          onComplete={handleCompleteCurrentSession}
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
                  onClick={() => handleActionClick(action)}
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
                <table className="w-full table-fixed border-separate border-spacing-0 text-[11px] text-[#334155]">
                  <colgroup>
                    <col className="w-[4%]" />
                    <col className="w-[4%]" />
                    <col className="w-[10%]" />
                    <col className="w-[23%]" />
                    <col className="w-[9%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                    <col className="w-[12%]" />
                    <col className="w-[7%]" />
                    <col className="w-[3%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-[#dfeeff] text-[11px] font-medium text-[#334155]">
                      <th className="rounded-l-[12px] px-2 py-3 text-center">
                        <StorageCheckbox
                          checked={allVisibleSelected}
                          onChange={(checked) =>
                            setSelectedIds(checked ? visibleAssets.map((asset) => asset.id) : [])
                          }
                          ariaLabel="Select all storage assets"
                        />
                      </th>
                      <th className="px-2 py-3 text-left">No</th>
                      <th className="px-2 py-3 text-left">ID</th>
                      <th className="px-2 py-3 text-left">Asset Name</th>
                      <th className="px-2 py-3 text-left">Date</th>
                      <th className="px-2 py-3 text-left">Category</th>
                      <th className="px-2 py-3 text-left">Location</th>
                      <th className="px-2 py-3 text-left">Condition</th>
                      <th className="px-2 py-3 text-left">Status</th>
                      <th className="px-2 py-3 text-right">Unit Cost</th>
                      <th className="rounded-r-[12px] px-2 py-3 text-center" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAssets.map((asset, index) => (
                      <tr key={asset.id} className="transition hover:bg-[#f8fbff]">
                        <td className="border-t border-[#edf2f7] px-2 py-3 text-center align-middle">
                          <div onClick={(event) => event.stopPropagation()}>
                            <StorageCheckbox
                              checked={selectedIds.includes(asset.id)}
                              onChange={(checked) =>
                                setSelectedIds((current) =>
                                  checked
                                    ? Array.from(new Set([...current, asset.id]))
                                    : current.filter((id) => id !== asset.id),
                                )
                              }
                              ariaLabel={`Select asset ${asset.assetCode}`}
                            />
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          {index + 1}
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle font-semibold text-[#0f172a]">
                          {asset.assetCode}
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          <Link
                            href={`/assets/${asset.id}?role=${currentRole}`}
                            className="block truncate font-medium text-[#111827] hover:text-[#2563eb]"
                          >
                            {asset.assetName}
                          </Link>
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          {formatDisplayDate(asset.receivedAt)}
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          <span className="inline-flex max-w-full truncate rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-2 py-[2px] text-[10px]">
                            {mapCategory(asset.category)}
                          </span>
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          <span className="block truncate">{asset.storageName}</span>
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          <StorageConditionBadge value={asset.conditionStatus} />
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 align-middle">
                          <StorageStatusBadge value={normalizeStorageStatus(asset.assetStatus)} />
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 text-right align-middle">
                          {formatCurrency(
                            asset.unitCost ?? 0,
                            parseCurrency(asset.currencyCode),
                          )}
                        </td>
                        <td className="border-t border-[#edf2f7] px-2 py-3 text-center align-middle">
                          <Link
                            href={`/assets/${asset.id}?role=${currentRole}`}
                            className="inline-block text-[18px] leading-none text-[#94a3b8]"
                          >
                            &#8942;
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="flex items-center justify-between px-1 pt-3 text-[10px] text-[#64748b]">
              <span>{selectedIds.length} of {visibleAssets.length} row(s) selected.</span>
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

function normalizeStorageStatus(value: string) {
  if (value === "inStorage" || value === "received" || value === "pendingAssignment") {
    return "available";
  }

  return value;
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

function StorageCensusWorkspace({
  selectedCount,
  currentSession,
  history,
  censusTitle,
  censusLocation,
  censusScope,
  censusNote,
  scopedAssetCount,
  availableLocations,
  onBack,
  onTitleChange,
  onLocationChange,
  onScopeChange,
  onNoteChange,
  onCreate,
  onComplete,
}: {
  selectedCount: number;
  currentSession: CensusSession | null;
  history: CensusSession[];
  censusTitle: string;
  censusLocation: string;
  censusScope: "selected" | "location" | "full";
  censusNote: string;
  scopedAssetCount: number;
  availableLocations: string[];
  onBack: () => void;
  onTitleChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onScopeChange: (value: "selected" | "location" | "full") => void;
  onNoteChange: (value: string) => void;
  onCreate: () => void;
  onComplete: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[14px] font-medium text-[#334155]"
        >
          <span aria-hidden="true">{"<-"}</span>
          <span>Back to Storage Assets</span>
        </button>
        <div className="rounded-full border border-[#d5e5f5] bg-white/80 px-4 py-2 text-[12px] font-medium text-[#47627f] shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
          {selectedCount} selected in storage list
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="rounded-[24px] border border-[#d7e5f3] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7c93b2]">
            1. Create A Census
          </p>
          <h2 className="mt-2 text-[24px] font-semibold text-[#0f172a]">
            Start a new count session
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#5d7087]">
            Keep creation simple: define the scope, choose the storage area, and launch the live session from one place.
          </p>

          <div className="mt-5 grid gap-4">
            <FieldBlock label="Session title">
              <input
                value={censusTitle}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder="Q2 Warehouse spot-check"
                className="h-12 w-full rounded-[14px] border border-[#d9e6f4] bg-[#fbfdff] px-4 text-[14px] text-[#0f172a] outline-none"
              />
            </FieldBlock>

            <div className="grid gap-4 md:grid-cols-2">
              <FieldBlock label="Location">
                <select
                  value={censusLocation}
                  onChange={(event) => onLocationChange(event.target.value)}
                  className="h-12 w-full rounded-[14px] border border-[#d9e6f4] bg-[#fbfdff] px-4 text-[14px] text-[#0f172a] outline-none"
                >
                  {availableLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </FieldBlock>
              <FieldBlock label="Scope">
                <div className="grid h-12 grid-cols-3 rounded-[14px] border border-[#d9e6f4] bg-[#fbfdff] p-1">
                  {[
                    { value: "selected", label: "Selected" },
                    { value: "location", label: "Location" },
                    { value: "full", label: "Full" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        onScopeChange(option.value as "selected" | "location" | "full")
                      }
                      className={`rounded-[10px] text-[12px] font-medium transition ${
                        censusScope === option.value
                          ? "bg-[#dfeeff] text-[#2563eb]"
                          : "text-[#64748b] hover:bg-[#f4f8fd]"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FieldBlock>
            </div>

            <FieldBlock label="Session note">
              <textarea
                value={censusNote}
                onChange={(event) => onNoteChange(event.target.value)}
                rows={4}
                placeholder="Why are we counting this set and what should the team verify?"
                className="w-full rounded-[14px] border border-[#d9e6f4] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#0f172a] outline-none"
              />
            </FieldBlock>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <CensusMetric label="Assets in scope" value={String(scopedAssetCount)} />
            <CensusMetric label="Selected now" value={String(selectedCount)} />
            <CensusMetric
              label="Estimated effort"
              value={scopedAssetCount > 40 ? "Large" : scopedAssetCount > 10 ? "Medium" : "Quick"}
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onCreate}
              disabled={scopedAssetCount === 0 || currentSession !== null}
              className="fx-submit-button h-11 px-5 text-[13px] font-medium disabled:opacity-50"
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
              <span className="fx-submit-label">Create census</span>
            </button>
            <p className="text-[12px] text-[#64748b]">
              One active session at a time keeps the process easy to follow.
            </p>
          </div>
        </section>
        <section className="rounded-[24px] border border-[#d7e5f3] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7c93b2]">
            2. Current Census Session
          </p>
          {currentSession ? (
            <div className="mt-3 space-y-4">
              <div className="rounded-[18px] border border-[#d8e6f4] bg-[linear-gradient(180deg,#eef6ff_0%,#fbfdff_100%)] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[22px] font-semibold text-[#0f172a]">
                      {currentSession.title}
                    </h3>
                    <p className="mt-2 text-[14px] text-[#5d7087]">
                      {currentSession.location}
                    </p>
                  </div>
                  <span className="rounded-full border border-[#bfdbfe] bg-[#eef4ff] px-3 py-1 text-[12px] font-semibold text-[#2563eb]">
                    Active
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <CensusMetric label="In scope" value={String(currentSession.assetCount)} />
                  <CensusMetric label="Counted" value={String(currentSession.progressCount)} />
                  <CensusMetric label="Due" value={formatDisplayDate(currentSession.dueAt)} />
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between text-[12px] text-[#64748b]">
                    <span>Progress</span>
                    <span>
                      {currentSession.assetCount === 0
                        ? "0%"
                        : `${Math.round((currentSession.progressCount / currentSession.assetCount) * 100)}%`}
                    </span>
                  </div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#e5edf7]">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#60a5fa_0%,#2563eb_100%)]"
                      style={{
                        width: `${
                          currentSession.assetCount === 0
                            ? 0
                            : (currentSession.progressCount / currentSession.assetCount) * 100
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={onComplete}
                    className="fx-submit-button h-11 px-5 text-[13px] font-medium"
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
                        <path d="m5 12 5 5L20 7" />
                      </svg>
                    </span>
                    <span className="fx-submit-label">Close session</span>
                  </button>
                  <div className="rounded-[14px] border border-[#e2e8f0] bg-white px-4 py-3 text-[12px] text-[#64748b]">
                    Owned by {currentSession.owner} since {formatDisplayDate(currentSession.startedAt)}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex min-h-[300px] flex-col items-center justify-center rounded-[18px] border border-dashed border-[#d7e5f3] bg-[#fbfdff] px-6 text-center">
              <p className="text-[16px] font-semibold text-[#0f172a]">
                No active census session
              </p>
              <p className="mt-2 max-w-[360px] text-[13px] leading-6 text-[#64748b]">
                Create a session on the left and it will appear here with clear progress, ownership, and the next action.
              </p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-[24px] border border-[#d7e5f3] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#7c93b2]">
              3. Previous Census Session History
            </p>
            <h2 className="mt-2 text-[24px] font-semibold text-[#0f172a]">
              Recent completed counts
            </h2>
          </div>
          <div className="rounded-full border border-[#d5e5f5] bg-[#f8fbff] px-4 py-2 text-[12px] font-medium text-[#47627f]">
            {history.length} sessions
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[18px] border border-[#dbe7f3]">
          <table className="w-full table-fixed text-left text-[12px] text-[#334155]">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[18%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[12%]" />
              <col className="w-[14%]" />
            </colgroup>
            <thead className="bg-[#e9f2fd] text-[#47627f]">
              <tr>
                <th className="px-4 py-3 font-medium">Session</th>
                <th className="px-4 py-3 font-medium">Location</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Assets</th>
                <th className="px-4 py-3 font-medium">Closed</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((session) => (
                <tr key={session.id} className="border-t border-[#edf2f7]">
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold text-[#0f172a]">{session.title}</p>
                    <p className="mt-1 text-[#8fa0ba]">{session.id}</p>
                  </td>
                  <td className="px-4 py-3 align-top">{session.location}</td>
                  <td className="px-4 py-3 align-top">
                    {session.scope === "selected"
                      ? "Selected"
                      : session.scope === "location"
                        ? "Location"
                        : "Full"}
                  </td>
                  <td className="px-4 py-3 align-top">{session.assetCount}</td>
                  <td className="px-4 py-3 align-top">
                    {session.completedAt ? formatDisplayDate(session.completedAt) : "-"}
                  </td>
                  <td className="px-4 py-3 align-top">{session.owner}</td>
                  <td className="px-4 py-3 align-top">
                    <span className="inline-flex rounded-full border border-[#bbf7d0] bg-[#effdf3] px-3 py-1 text-[11px] font-medium text-[#15803d]">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[12px] font-medium text-[#64748b]">{label}</span>
      {children}
    </label>
  );
}

function CensusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-[#dbe7f3] bg-[#fbfdff] px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8fa0ba]">{label}</p>
      <p className="mt-2 text-[20px] font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function createInitialCensusHistory(assets: StorageAssetDto[]): CensusSession[] {
  if (assets.length === 0) {
    return [];
  }

  const uniqueLocations = Array.from(new Set(assets.map((asset) => asset.storageName)));

  return uniqueLocations.slice(0, 3).map((location, index) => {
    const assetCount = assets.filter((asset) => asset.storageName === location).length;
    const completedAt = new Date(Date.now() - (index + 1) * 1000 * 60 * 60 * 24 * 7);

    return {
      id: `CNS-2026-${String(index + 1).padStart(3, "0")}`,
      title: `${location} weekly check`,
      location,
      scope: "location",
      status: "completed",
      assetCount,
      createdAt: completedAt.toISOString(),
      startedAt: completedAt.toISOString(),
      dueAt: completedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      progressCount: assetCount,
      owner: "Batbayar Dorj",
      note: "Completed stock verification for the area.",
    };
  });
}
