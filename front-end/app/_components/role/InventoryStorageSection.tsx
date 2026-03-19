"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  downloadAssetLabelsPdfRequest,
  fetchStorageAssetsRequest,
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import { downloadBase64File } from "@/app/_lib/download-base64";
import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import {
  StorageCategoryBadge,
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
const CONDITION_FILTERS = ["All Conditions", "Good", "Damaged", "Defective", "Missing"] as const;
const STATUS_FILTERS = [
  "All Statuses",
  "Available",
  "Assigned",
  "In Repair",
  "Pending Disposal",
  "Pending Retrieval",
] as const;

type StorageWorkspaceView = "assets" | "census";
type StorageHeaderMenu =
  | "type"
  | "sort"
  | "category"
  | "location"
  | "condition"
  | "status"
  | "actions"
  | null;

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
  const [sortMode, setSortMode] = useState<
    "recent" | "oldest" | "name" | "cost_desc" | "cost_asc"
  >("recent");
  const [selectedLocationFilter, setSelectedLocationFilter] = useState("All Locations");
  const [selectedConditionFilter, setSelectedConditionFilter] =
    useState<(typeof CONDITION_FILTERS)[number]>("All Conditions");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<(typeof STATUS_FILTERS)[number]>("All Statuses");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setView] = useState<StorageWorkspaceView>("assets");
  const [censusTitle, setCensusTitle] = useState("");
  const [censusLocation, setCensusLocation] = useState("Main warehouse / Intake");
  const [censusScope, setCensusScope] = useState<"selected" | "location" | "full">("selected");
  const [censusNote, setCensusNote] = useState("");
  const [currentSession, setCurrentSession] = useState<CensusSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<CensusSession[]>([]);
  const [openHeaderMenu, setOpenHeaderMenu] = useState<StorageHeaderMenu>(null);
  const [openRowActionId, setOpenRowActionId] = useState<string | null>(null);
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
        mapCategory(asset.category),
        asset.itemType,
        asset.storageName,
        asset.serialNumber ?? "",
        asset.qrCode,
        humanizeConditionValue(asset.conditionStatus),
        humanizeStatusValue(normalizeStorageStatus(asset.assetStatus)),
        formatDisplayDate(asset.receivedAt),
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

  const locationOptions = useMemo(
    () => ["All Locations", ...Array.from(new Set(searchedAssets.map((asset) => asset.storageName)))],
    [searchedAssets],
  );

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
    const conditionFilteredAssets =
      selectedConditionFilter === "All Conditions"
        ? typeFilteredAssets
        : typeFilteredAssets.filter(
            (asset) =>
              humanizeConditionValue(asset.conditionStatus) === selectedConditionFilter,
          );
    const statusFilteredAssets =
      selectedStatusFilter === "All Statuses"
        ? conditionFilteredAssets
        : conditionFilteredAssets.filter(
            (asset) =>
              humanizeStatusValue(normalizeStorageStatus(asset.assetStatus)) ===
              selectedStatusFilter,
          );
    const locationFilteredAssets =
      selectedLocationFilter === "All Locations"
        ? statusFilteredAssets
        : statusFilteredAssets.filter((asset) => asset.storageName === selectedLocationFilter);

    return [...locationFilteredAssets].sort((left, right) => {
      if (sortMode === "name") {
        return left.assetName.localeCompare(right.assetName);
      }

      if (sortMode === "cost_desc") {
        return (right.unitCost ?? 0) - (left.unitCost ?? 0);
      }

      if (sortMode === "cost_asc") {
        return (left.unitCost ?? 0) - (right.unitCost ?? 0);
      }

      if (sortMode === "oldest") {
        return left.receivedAt.localeCompare(right.receivedAt);
      }

      return right.receivedAt.localeCompare(left.receivedAt);
    });
  }, [
    selectedLocationFilter,
    searchedAssets,
    selectedCategory,
    selectedConditionFilter,
    selectedStatusFilter,
    selectedType,
    sortMode,
  ]);

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

  useEffect(() => {
    function handlePointerDown() {
      setOpenHeaderMenu(null);
      setOpenRowActionId(null);
    }

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleActionClick(action: (typeof ACTIONS)[number]) {
    if (action === "Census") {
      setView("census");
    }
  }

  async function handleDownloadLabels() {
    if (selectedIds.length === 0) {
      setActionErrorMessage("Select at least one asset to print labels.");
      return;
    }

    setIsDownloadingPdf(true);
    setActionErrorMessage(null);

    try {
      const selectedAssetCodes = assets
        .filter((asset) => selectedIds.includes(asset.id))
        .map((asset) => asset.assetCode);
      const pdf = await downloadAssetLabelsPdfRequest(selectedAssetCodes);
      downloadBase64File(pdf);
    } catch (error) {
      setActionErrorMessage(
        error instanceof Error ? error.message : "Failed to download asset labels.",
      );
    } finally {
      setIsDownloadingPdf(false);
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
      contentWidthClassName="max-w-[1320px]"
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
            <div className="flex flex-wrap gap-3">
              <div className="relative min-w-[280px] flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8fa0ba]">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="4.8" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  value={searchValue}
                  onChange={(event) => setSearchValue(event.target.value)}
                  placeholder="Search by QR, asset, category, type, requester, or department..."
                  className="h-11 w-full rounded-[14px] border border-[#dbe8f5] bg-white pl-11 pr-4 text-[14px] text-[#334155] outline-none shadow-[0_4px_12px_rgba(148,163,184,0.08)] placeholder:text-[#94a3b8]"
                />
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
              <button
                type="button"
                onClick={() => void handleDownloadLabels()}
                disabled={selectedIds.length === 0 || isDownloadingPdf}
                className="fx-submit-button h-10 px-4 text-[12px] font-medium disabled:opacity-60"
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
                    <path d="M12 3v12" />
                    <path d="m7 10 5 5 5-5" />
                    <path d="M5 21h14" />
                  </svg>
                </span>
                <span className="fx-submit-label">
                  {isDownloadingPdf ? "Preparing..." : "Print Labels"}
                </span>
              </button>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenHeaderMenu((current) => (current === "type" ? null : "type"));
                }}
                className="relative h-10 min-w-[180px] rounded-[10px] border border-[#dbe8f5] bg-white px-3 text-left text-[13px] text-[#334155] shadow-[0_4px_12px_rgba(148,163,184,0.08)]"
              >
                <span>{selectedType}</span>
                <HeaderMenuChevron />
                {openHeaderMenu === "type" ? (
                  <HeaderMenuPanel>
                    {typeOptions.map((type) => (
                      <HeaderMenuItem
                        key={type}
                        label={type}
                        selected={selectedType === type}
                        onClick={() => {
                          setSelectedType(type);
                          setOpenHeaderMenu(null);
                        }}
                      />
                    ))}
                  </HeaderMenuPanel>
                ) : null}
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setOpenHeaderMenu((current) => (current === "sort" ? null : "sort"));
                }}
                className="relative h-10 min-w-[180px] rounded-[10px] border border-[#dbe8f5] bg-white px-3 text-left text-[13px] text-[#334155] shadow-[0_4px_12px_rgba(148,163,184,0.08)]"
              >
                <span>
                  {sortMode === "recent"
                    ? "Sort: Latest received"
                    : sortMode === "oldest"
                      ? "Sort: Oldest received"
                      : sortMode === "name"
                        ? "Sort: Asset name"
                        : sortMode === "cost_asc"
                          ? "Sort: Lowest cost"
                          : "Sort: Highest cost"}
                </span>
                <HeaderMenuChevron />
                {openHeaderMenu === "sort" ? (
                  <HeaderMenuPanel>
                    <HeaderMenuItem
                      label="Sort: Latest received"
                      selected={sortMode === "recent"}
                      onClick={() => {
                        setSortMode("recent");
                        setOpenHeaderMenu(null);
                      }}
                    />
                    <HeaderMenuItem
                      label="Sort: Oldest received"
                      selected={sortMode === "oldest"}
                      onClick={() => {
                        setSortMode("oldest");
                        setOpenHeaderMenu(null);
                      }}
                    />
                    <HeaderMenuItem
                      label="Sort: Asset name"
                      selected={sortMode === "name"}
                      onClick={() => {
                        setSortMode("name");
                        setOpenHeaderMenu(null);
                      }}
                    />
                    <HeaderMenuItem
                      label="Sort: Lowest cost"
                      selected={sortMode === "cost_asc"}
                      onClick={() => {
                        setSortMode("cost_asc");
                        setOpenHeaderMenu(null);
                      }}
                    />
                    <HeaderMenuItem
                      label="Sort: Highest cost"
                      selected={sortMode === "cost_desc"}
                      onClick={() => {
                        setSortMode("cost_desc");
                        setOpenHeaderMenu(null);
                      }}
                    />
                  </HeaderMenuPanel>
                ) : null}
              </button>
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
            {actionErrorMessage ? (
              <p className="mt-3 text-[12px] font-medium text-[#dc2626]">
                {actionErrorMessage}
              </p>
            ) : null}
          </div>
          <div className="space-y-4 px-4 pb-3">
            <div className="overflow-x-auto rounded-[14px] border border-[#dbe7f3] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.10)]">
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
                <table className="min-w-[1320px] w-full table-auto border-separate border-spacing-y-0 text-[12px] text-[#334155]">
                  <thead>
                    <tr className="bg-[#dfeeff] text-[12px] font-semibold text-[#334155]">
                      <th className="w-[52px] rounded-l-[12px] px-3 py-4 text-center align-middle">
                        <StorageCheckbox
                          checked={allVisibleSelected}
                          onChange={(checked) =>
                            setSelectedIds(checked ? visibleAssets.map((asset) => asset.id) : [])
                          }
                          ariaLabel="Select all storage assets"
                        />
                      </th>
                      <th className="w-[48px] px-3 py-4 text-left align-middle">No</th>
                      <th className="w-[132px] px-3 py-4 text-left align-middle">ID</th>
                      <th className="min-w-[220px] px-3 py-4 text-left align-middle">
                        <div className="flex items-center">Asset Name</div>
                      </th>
                      <th className="w-[110px] px-3 py-4 text-left align-middle">
                        <TableHeaderSortTrigger
                          label="Date"
                          direction={sortMode === "recent" ? "desc" : sortMode === "oldest" ? "asc" : null}
                          onClick={() =>
                            setSortMode((current) => (current === "recent" ? "oldest" : "recent"))
                          }
                        />
                      </th>
                      <th className="min-w-[160px] px-3 py-4 text-left align-middle">
                        <TableHeaderTrigger
                          label="Category"
                          open={openHeaderMenu === "category"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenHeaderMenu((current) => (current === "category" ? null : "category"));
                          }}
                        >
                          <HeaderMenuItem
                            label="All Categories"
                            selected={selectedCategory === "All Categories"}
                            onClick={() => {
                              setSelectedCategory("All Categories");
                              setOpenHeaderMenu(null);
                            }}
                          />
                          {CATEGORIES.filter((category) => category !== "All Categories").map((category) => (
                            <HeaderMenuItem
                              key={category}
                              label={category}
                              preview={<StorageCategoryBadge label={category} />}
                              selected={selectedCategory === category}
                              onClick={() => {
                                setSelectedCategory(category);
                                setSelectedType("All Types");
                                setOpenHeaderMenu(null);
                              }}
                            />
                          ))}
                        </TableHeaderTrigger>
                      </th>
                      <th className="min-w-[200px] px-3 py-4 text-left align-middle">
                        <TableHeaderTrigger
                          label="Location"
                          open={openHeaderMenu === "location"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenHeaderMenu((current) => (current === "location" ? null : "location"));
                          }}
                        >
                          {locationOptions.map((location) => (
                            <HeaderMenuItem
                              key={location}
                              label={location}
                              selected={selectedLocationFilter === location}
                              onClick={() => {
                                setSelectedLocationFilter(location);
                                setOpenHeaderMenu(null);
                              }}
                            />
                          ))}
                        </TableHeaderTrigger>
                      </th>
                      <th className="min-w-[150px] px-3 py-4 text-left align-middle">
                        <TableHeaderTrigger
                          label="Condition"
                          open={openHeaderMenu === "condition"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenHeaderMenu((current) => (current === "condition" ? null : "condition"));
                          }}
                        >
                          {CONDITION_FILTERS.map((option) => (
                            <HeaderMenuItem
                              key={option}
                              label={option}
                              preview={
                                option === "All Conditions" ? undefined : (
                                  <StorageConditionBadge value={conditionFilterToValue(option)} />
                                )
                              }
                              selected={selectedConditionFilter === option}
                              onClick={() => {
                                setSelectedConditionFilter(option);
                                setOpenHeaderMenu(null);
                              }}
                            />
                          ))}
                        </TableHeaderTrigger>
                      </th>
                      <th className="min-w-[150px] px-3 py-4 text-left align-middle">
                        <TableHeaderTrigger
                          label="Status"
                          open={openHeaderMenu === "status"}
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenHeaderMenu((current) => (current === "status" ? null : "status"));
                          }}
                        >
                          {STATUS_FILTERS.map((option) => (
                            <HeaderMenuItem
                              key={option}
                              label={option}
                              preview={
                                option === "All Statuses" ? undefined : (
                                  <StorageStatusBadge value={statusFilterToValue(option)} />
                                )
                              }
                              selected={selectedStatusFilter === option}
                              onClick={() => {
                                setSelectedStatusFilter(option);
                                setOpenHeaderMenu(null);
                              }}
                            />
                          ))}
                        </TableHeaderTrigger>
                      </th>
                      <th className="w-[96px] px-3 py-4 text-right align-middle">
                        <div className="flex justify-end">
                          <TableHeaderSortTrigger
                            label="Unit Cost"
                            align="right"
                            direction={sortMode === "cost_desc" ? "desc" : sortMode === "cost_asc" ? "asc" : null}
                            onClick={() =>
                              setSortMode((current) => (current === "cost_desc" ? "cost_asc" : "cost_desc"))
                            }
                          />
                        </div>
                      </th>
                      <th className="w-[44px] rounded-r-[12px] px-3 py-4 text-center align-middle" />
                    </tr>
                  </thead>
                  <tbody>
                    {visibleAssets.map((asset, index) => (
                      <tr key={asset.id} className="transition hover:bg-[#f8fbff]">
                        <td className="border-t border-[#edf2f7] px-3 py-4 text-center align-middle">
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
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          {index + 1}
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle font-semibold text-[#0f172a]">
                          <div className="whitespace-nowrap leading-6">{asset.assetCode}</div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="flex items-center">
                            <Link
                              href={`/assets/${asset.id}?role=${currentRole}`}
                              className="block whitespace-nowrap font-medium leading-6 text-[#111827] hover:text-[#2563eb]"
                            >
                              {asset.assetName}
                            </Link>
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="whitespace-nowrap leading-6">{formatDisplayDate(asset.receivedAt)}</div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="flex items-center">
                            <StorageCategoryBadge label={mapCategory(asset.category)} />
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="leading-6">
                            <span className="block whitespace-nowrap">{asset.storageName}</span>
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="flex items-center">
                            <StorageConditionBadge value={asset.conditionStatus} />
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 align-middle">
                          <div className="flex items-center">
                            <StorageStatusBadge value={normalizeStorageStatus(asset.assetStatus)} />
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 text-right align-middle">
                          <div className="whitespace-nowrap leading-6">
                            {formatCurrency(
                              asset.unitCost ?? 0,
                              parseCurrency(asset.currencyCode),
                            )}
                          </div>
                        </td>
                        <td className="border-t border-[#edf2f7] px-3 py-4 text-center align-middle">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                setOpenRowActionId((current) => current === asset.id ? null : asset.id);
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[18px] leading-none text-[#94a3b8] transition hover:bg-[#f1f5f9]"
                            >
                              &#8942;
                            </button>
                            {openRowActionId === asset.id ? (
                              <div
                                onClick={(event) => event.stopPropagation()}
                                className="absolute right-0 top-[calc(100%+8px)] z-20 min-w-[150px] rounded-[14px] border border-[#d7e2ef] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
                              >
                                <Link
                                  href={`/assets/${asset.id}?role=${currentRole}`}
                                  className="flex items-center justify-between rounded-[10px] px-3 py-2 text-[14px] text-[#344054] hover:bg-[#f8fbff]"
                                >
                                  <span>View Details</span>
                                  <span aria-hidden="true">{"->"}</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAssets((current) => current.filter((entry) => entry.id !== asset.id));
                                    setSelectedIds((current) => current.filter((id) => id !== asset.id));
                                    setOpenRowActionId(null);
                                  }}
                                  className="mt-1 flex w-full items-center justify-between rounded-[10px] px-3 py-2 text-[14px] text-[#dc2626] hover:bg-[#fff1f3]"
                                >
                                  <span>Delete</span>
                                  <span aria-hidden="true">{"×"}</span>
                                </button>
                              </div>
                            ) : null}
                          </div>
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

function TableHeaderTrigger({
  label,
  open,
  onClick,
  children,
}: {
  label: string;
  open: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 text-left"
      >
        <span>{label}</span>
        <HeaderMenuChevron compact absolute={false} />
      </button>
      {open ? <HeaderMenuPanel>{children}</HeaderMenuPanel> : null}
    </div>
  );
}

function TableHeaderSortTrigger({
  label,
  direction,
  align = "left",
  onClick,
}: {
  label: string;
  direction: "asc" | "desc" | null;
  align?: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 ${align === "right" ? "justify-end text-right" : "text-left"}`}
    >
      <span>{label}</span>
      <span className="inline-flex flex-col text-[#94a3b8]" aria-hidden="true">
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          className={direction === "asc" ? "text-[#2563eb]" : ""}
        >
          <path d="M5 1L8 4H2L5 1Z" fill="currentColor" />
        </svg>
        <svg
          width="10"
          height="8"
          viewBox="0 0 10 8"
          fill="none"
          className={`-mt-[1px] ${direction === "desc" ? "text-[#2563eb]" : ""}`}
        >
          <path d="M5 7L2 4H8L5 7Z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}

function HeaderMenuPanel({ children }: { children: React.ReactNode }) {
  return (
    <div
      onClick={(event) => event.stopPropagation()}
      className="absolute left-0 top-[calc(100%+10px)] z-20 min-w-[176px] rounded-[16px] border border-[#d7e2ef] bg-white p-2 shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
    >
      {children}
    </div>
  );
}

function HeaderMenuItem({
  label,
  preview,
  selected,
  onClick,
}: {
  label: string;
  preview?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2 text-left text-[14px] transition ${
        selected ? "bg-[#f8fbff] text-[#2563eb]" : "text-[#344054] hover:bg-[#f8fbff]"
      }`}
    >
      {preview ?? <span>{label}</span>}
      {selected ? <span aria-hidden="true">✓</span> : null}
    </button>
  );
}

function HeaderMenuChevron({
  compact = false,
  absolute = true,
}: {
  compact?: boolean;
  absolute?: boolean;
}) {
  return (
    <svg
      width={compact ? "14" : "16"}
      height={compact ? "14" : "16"}
      viewBox="0 0 16 16"
      fill="none"
      className={`${absolute ? "absolute right-3 top-1/2 -translate-y-1/2" : "shrink-0"} text-[#64748b]`}
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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

function humanizeConditionValue(value: string) {
  if (value === "good") return "Good";
  if (value === "damaged") return "Damaged";
  if (value === "defective") return "Defective";
  if (value === "missing") return "Missing";

  return value;
}

function humanizeStatusValue(value: string) {
  if (value === "available") return "Available";
  if (value === "assigned") return "Assigned";
  if (value === "inRepair") return "In Repair";
  if (value === "pendingDisposal") return "Pending Disposal";
  if (value === "pendingRetrieval") return "Pending Retrieval";

  return value;
}

function conditionFilterToValue(value: (typeof CONDITION_FILTERS)[number]) {
  if (value === "Good") return "good";
  if (value === "Damaged") return "damaged";
  if (value === "Defective") return "defective";
  if (value === "Missing") return "missing";

  return "good";
}

function statusFilterToValue(value: (typeof STATUS_FILTERS)[number]) {
  if (value === "Available") return "available";
  if (value === "Assigned") return "assigned";
  if (value === "In Repair") return "inRepair";
  if (value === "Pending Disposal") return "pendingDisposal";
  if (value === "Pending Retrieval") return "pendingRetrieval";

  return "available";
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
