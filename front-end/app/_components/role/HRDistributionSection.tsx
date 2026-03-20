"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignAssetDistributionRequest,
  fetchAssetDistributionsRequest,
  fetchEmployeeDirectoryRequest,
  returnAssetDistributionRequest,
  type EmployeeDirectoryEntryDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import {
  fetchStorageAssetsRequest,
  fetchStorageLocationsRequest,
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import DistributionAssetGrid from "../distribution/DistributionAssetGrid";
import DistributionFilterPanel, {
  type DistributionStatusFilter,
  type DistributionTab,
} from "../distribution/DistributionFilterPanel";
import DistributionHeader from "../distribution/DistributionHeader";
import {
  buildAssignedItems,
  buildAvailableItems,
  buildHistoryMap,
  matchesAssetQuery,
  type DistributionItem,
  type DistributionSession,
} from "../distribution/hrDistributionHelpers";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { formatDisplayDate } from "@/app/_lib/order-format";

const RECIPIENT_ROLE_OPTIONS = ["Employee", "Department Lead", "IT Admin"] as const;
const DEFAULT_STORAGE_LOCATION = "Main warehouse / Intake";

type RetrievalFormState = {
  storageLocation: string;
  usageYears: string;
  returnCondition: string;
  returnPower: string;
  note: string;
};

const DEFAULT_RETRIEVAL_FORM: RetrievalFormState = {
  storageLocation: DEFAULT_STORAGE_LOCATION,
  usageYears: "",
  returnCondition: "Good",
  returnPower: "Working",
  note: "",
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function matchesItemStatus(
  item: DistributionItem,
  selectedStatus: DistributionStatusFilter,
) {
  if (selectedStatus === "All status") {
    return true;
  }

  const assetStatus = normalize(item.assetStatus);

  if (selectedStatus === "Pending signature") {
    return assetStatus === "pendingassignment";
  }

  if (selectedStatus === "Signed") {
    return assetStatus === "assigned";
  }

  if (selectedStatus === "Returned") {
    return ["instorage", "available", "received"].includes(assetStatus);
  }

  return assetStatus === "assigned" || assetStatus === "pendingretrieval";
}

function isAssignableAsset(item: DistributionItem) {
  const status = normalize(item.assetStatus);
  return ["instorage", "available", "received"].includes(status);
}

function fallbackStorageLocations(storageLocations: string[]) {
  const normalized = storageLocations.map((value) => value.trim()).filter(Boolean);
  if (normalized.length > 0) {
    return normalized;
  }

  return [
    DEFAULT_STORAGE_LOCATION,
    "Warehouse A",
    "Warehouse B",
    "Office A",
    "Office B",
    "Office C",
  ];
}

export function HRDistributionSection() {
  const [records, setRecords] = useState<DistributionRecordDto[]>([]);
  const [storageAssets, setStorageAssets] = useState<StorageAssetDto[]>([]);
  const [storageLocations, setStorageLocations] = useState<string[]>([]);
  const [employees, setEmployees] = useState<EmployeeDirectoryEntryDto[]>([]);
  const [activeTab, setActiveTab] = useState<DistributionTab>("available-assets");
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] =
    useState<DistributionStatusFilter>("All status");
  const [selectedRole, setSelectedRole] = useState("All roles");
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState("All employees");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All categories");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState("All types");
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [assignRecipientRole, setAssignRecipientRole] =
    useState<(typeof RECIPIENT_ROLE_OPTIONS)[number]>("Employee");
  const [assignNote, setAssignNote] = useState("");
  const [assignTarget, setAssignTarget] = useState<DistributionItem | null>(null);
  const [assignedDetailTarget, setAssignedDetailTarget] = useState<DistributionItem | null>(null);
  const [retrieveTarget, setRetrieveTarget] = useState<DistributionItem | null>(null);
  const [retrieveForm, setRetrieveForm] =
    useState<RetrievalFormState>(DEFAULT_RETRIEVAL_FORM);
  const [notice, setNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);

  async function reload() {
    const [nextRecords, nextAssets, nextLocations, nextEmployees] = await Promise.all([
      fetchAssetDistributionsRequest(true),
      fetchStorageAssetsRequest(),
      fetchStorageLocationsRequest(),
      fetchEmployeeDirectoryRequest(true),
    ]);

    setRecords(nextRecords);
    setStorageAssets(nextAssets);
    setStorageLocations(fallbackStorageLocations(nextLocations));
    setEmployees(nextEmployees);
  }

  useEffect(() => {
    let live = true;
    setErrorMessage(null);

    void Promise.all([
      fetchAssetDistributionsRequest(true),
      fetchStorageAssetsRequest(),
      fetchStorageLocationsRequest(),
      fetchEmployeeDirectoryRequest(true),
    ])
      .then(([nextRecords, nextAssets, nextLocations, nextEmployees]) => {
        if (!live) {
          return;
        }

        setRecords(nextRecords);
        setStorageAssets(nextAssets);
        setStorageLocations(fallbackStorageLocations(nextLocations));
        setEmployees(nextEmployees);
      })
      .catch((error) => {
        if (!live) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Failed to load distribution data.",
        );
      });

    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    if (employees.length === 0) {
      setAssignEmployeeId("");
      return;
    }

    if (employees.some((employee) => employee.id === assignEmployeeId)) {
      return;
    }

    setAssignEmployeeId(employees[0]?.id ?? "");
  }, [assignEmployeeId, employees]);

  const selectedEmployee = useMemo(
    () => employees.find((employee) => employee.id === assignEmployeeId) ?? null,
    [assignEmployeeId, employees],
  );

  const historyMap = useMemo(() => buildHistoryMap(records), [records]);

  const roleOptions = useMemo(
    () => [
      "All roles",
      ...Array.from(
        new Set(
          [
            ...records.map((record) => record.recipientRole),
            ...employees.map((employee) => employee.position),
          ].filter(Boolean),
        ),
      ),
    ],
    [employees, records],
  );

  const employeeOptions = useMemo(
    () => ["All employees", ...Array.from(new Set(employees.map((employee) => employee.fullName)))],
    [employees],
  );

  const categoryOptions = useMemo(
    () => [
      "All categories",
      ...Array.from(new Set([...storageAssets.map((item) => item.category), ...records.map((item) => item.category)].filter(Boolean))),
    ],
    [records, storageAssets],
  );

  const typeOptions = useMemo(
    () => [
      "All types",
      ...Array.from(new Set([...storageAssets.map((item) => item.itemType), ...records.map((item) => item.itemType)].filter(Boolean))),
    ],
    [records, storageAssets],
  );

  const availableBase = useMemo(
    () =>
      buildAvailableItems(storageAssets, historyMap).filter(
        (item) => isAssignableAsset(item) && item.holder === null,
      ),
    [historyMap, storageAssets],
  );

  const assignedBase = useMemo(() => buildAssignedItems(records), [records]);

  const pendingRetrievalBase = useMemo(
    () => assignedBase,
    [assignedBase],
  );

  const availableItems = useMemo(
    () =>
      availableBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) &&
          matchesItemStatus(item, selectedStatus) &&
          matchesAdvancedFilters(item, {
            selectedRole,
            selectedEmployee: selectedEmployeeFilter,
            selectedCategory: selectedCategoryFilter,
            selectedType: selectedTypeFilter,
          }),
      ),
    [availableBase, searchValue, selectedStatus, selectedRole, selectedEmployeeFilter, selectedCategoryFilter, selectedTypeFilter],
  );

  const assignedItems = useMemo(
    () =>
      assignedBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) &&
          matchesItemStatus(item, selectedStatus) &&
          matchesAdvancedFilters(item, {
            selectedRole,
            selectedEmployee: selectedEmployeeFilter,
            selectedCategory: selectedCategoryFilter,
            selectedType: selectedTypeFilter,
          }),
      ),
    [assignedBase, searchValue, selectedStatus, selectedRole, selectedEmployeeFilter, selectedCategoryFilter, selectedTypeFilter],
  );

  const pendingRetrievalItems = useMemo(
    () =>
      pendingRetrievalBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) &&
          matchesItemStatus(item, selectedStatus) &&
          matchesAdvancedFilters(item, {
            selectedRole,
            selectedEmployee: selectedEmployeeFilter,
            selectedCategory: selectedCategoryFilter,
            selectedType: selectedTypeFilter,
          }),
      ),
    [pendingRetrievalBase, searchValue, selectedStatus, selectedRole, selectedEmployeeFilter, selectedCategoryFilter, selectedTypeFilter],
  );

  const metricStats = useMemo(() => {
    const pending = records.filter((record) => {
      const distributionStatus = normalize(record.status);
      const assetStatus = normalize(record.assetStatus);
      return distributionStatus === "pendinghandover" || assetStatus === "pendingretrieval";
    }).length;

    const inTransit = records.filter(
      (record) => normalize(record.status) === "active" && !record.returnedAt,
    ).length;

    const delivered = records.filter(
      (record) => normalize(record.status) === "returned" || Boolean(record.returnedAt),
    ).length;

    const signed = records.filter(
      (record) =>
        normalize(record.status) === "active" && normalize(record.assetStatus) === "assigned",
    ).length;

    return {
      pending,
      inTransit,
      delivered,
      signed,
    };
  }, [records]);

  const counts: Record<DistributionTab, number> = {
    "available-assets": availableItems.length,
    "assigned-assets": assignedItems.length,
    "pending-retrieval": pendingRetrievalItems.length,
  };

  const visibleGridItems =
    activeTab === "available-assets"
      ? availableItems
      : activeTab === "assigned-assets"
        ? assignedItems
        : pendingRetrievalItems;

  const gridActionLabel =
    activeTab === "available-assets"
      ? "Assign"
      : activeTab === "assigned-assets"
        ? "History"
        : "Retrieve";

  async function handleAssignConfirm() {
    if (!assignTarget) {
      return;
    }

    if (!selectedEmployee) {
      setErrorMessage("Select an employee before assigning an asset.");
      return;
    }

    try {
      setIsAssigning(true);
      setErrorMessage(null);
      await assignAssetDistributionRequest({
        assetId: assignTarget.id,
        employeeId: selectedEmployee.id,
        employeeName: selectedEmployee.fullName,
        recipientRole: assignRecipientRole,
        note: assignNote.trim() || null,
      });
      setNotice(`Assigned ${assignTarget.assetCode} to ${selectedEmployee.fullName}.`);
      setAssignTarget(null);
      setAssignNote("");
      await reload();
      setActiveTab("assigned-assets");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to assign asset.",
      );
    } finally {
      setIsAssigning(false);
    }
  }

  async function handleRetrieveConfirm() {
    if (!retrieveTarget?.distributionId) {
      return;
    }

    try {
      setIsRetrieving(true);
      setErrorMessage(null);
      await returnAssetDistributionRequest({
        distributionId: retrieveTarget.distributionId,
        storageLocation: retrieveForm.storageLocation,
        usageYears: retrieveForm.usageYears.trim() || null,
        returnCondition: retrieveForm.returnCondition,
        returnPower: retrieveForm.returnPower,
        note: retrieveForm.note.trim() || null,
      });
      setNotice(`${retrieveTarget.assetCode} returned to storage.`);
      setRetrieveTarget(null);
      setRetrieveForm(DEFAULT_RETRIEVAL_FORM);
      await reload();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to retrieve asset.",
      );
    } finally {
      setIsRetrieving(false);
    }
  }

  const handleGridAction = (item: DistributionItem) => {
    if (activeTab === "available-assets") {
      setAssignTarget(item);
      setAssignNote("");
      return;
    }

    if (activeTab === "assigned-assets") {
      setAssignedDetailTarget(item);
      return;
    }

    setRetrieveTarget(item);
    const currentSession = item.sessions.find((session) => session.returnedAt === "-");
    setRetrieveForm({
      storageLocation: DEFAULT_STORAGE_LOCATION,
      usageYears:
        currentSession?.assignedAt
          ? calculateUsageYearsDisplay(currentSession.assignedAt)
          : "",
      returnCondition: "Good",
      returnPower: "Working",
      note: "",
    });
  };

  return (
    <WorkspaceShell
      hideHeader
      title="Distribution"
      subtitle=""
      contentAlignment="left"
      contentWidthClassName="max-w-none"
      outerClassName="pl-[44px] pr-[60px] pt-[60px] pb-[24px]"
      backgroundClassName="bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_34%,#ffffff_74%)]"
    >
      <DistributionHeader
        pendingCount={metricStats.pending}
        inTransitCount={metricStats.inTransit}
        deliveredCount={metricStats.delivered}
        signedCount={metricStats.signed}
        onCreateDistribution={() => setActiveTab("available-assets")}
      />

      <DistributionFilterPanel
        activeTab={activeTab}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onTabChange={setActiveTab}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        selectedEmployee={selectedEmployeeFilter}
        onEmployeeChange={setSelectedEmployeeFilter}
        selectedCategory={selectedCategoryFilter}
        onCategoryChange={setSelectedCategoryFilter}
        selectedType={selectedTypeFilter}
        onTypeChange={setSelectedTypeFilter}
        roleOptions={roleOptions}
        employeeOptions={employeeOptions}
        categoryOptions={categoryOptions}
        typeOptions={typeOptions}
        counts={counts}
      />

      {notice ? (
        <div className="mt-4 rounded-[12px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[14px] text-[#166534]">
          {notice}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-4 rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b91c1c]">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-4 flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="distribution-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
          <DistributionAssetGrid
            items={visibleGridItems}
            actionLabel={gridActionLabel}
            actionVariant={activeTab === "pending-retrieval" ? "danger" : "primary"}
            onAction={handleGridAction}
            secondaryActionLabel={activeTab === "available-assets" ? "History" : undefined}
            onSecondaryAction={
              activeTab === "available-assets"
                ? (item) => setAssignedDetailTarget(item)
                : undefined
            }
            showHistorySummary={activeTab !== "assigned-assets"}
          />
        </div>
      </div>

      {assignTarget ? (
        <ModalFrame title="Assign Asset" onClose={() => setAssignTarget(null)}>
          <div className="space-y-3">
            <p className="text-[13px] text-[#334155]">
              {assignTarget.assetName} ({assignTarget.assetCode})
            </p>

            <label className="block text-[12px] text-[#475569]">
              Recipient role
              <select
                value={assignRecipientRole}
                onChange={(event) =>
                  setAssignRecipientRole(
                    event.target.value as (typeof RECIPIENT_ROLE_OPTIONS)[number],
                  )
                }
                className="mt-1 h-10 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
              >
                {RECIPIENT_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[12px] text-[#475569]">
              Employee
              <select
                value={assignEmployeeId}
                onChange={(event) => setAssignEmployeeId(event.target.value)}
                className="mt-1 h-10 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
              >
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[12px] text-[#475569]">
              Note
              <textarea
                value={assignNote}
                onChange={(event) => setAssignNote(event.target.value)}
                rows={3}
                className="mt-1 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 py-2 text-[14px] text-[#0f172a] outline-none"
                placeholder="Optional assignment note"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignTarget(null)}
                className="rounded-[8px] border border-[#d7e4f2] px-4 py-2 text-[14px] text-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleAssignConfirm()}
                disabled={isAssigning}
                className="rounded-[8px] bg-[#0f172a] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
              >
                {isAssigning ? "Assigning..." : "Confirm assign"}
              </button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {assignedDetailTarget ? (
        <ModalFrame
          title="Assigned Asset History"
          onClose={() => setAssignedDetailTarget(null)}
        >
          <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
            <div className="rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info
                  label="Asset"
                  value={`${assignedDetailTarget.assetName} (${assignedDetailTarget.assetCode})`}
                />
                <Info
                  label="Current holder"
                  value={
                    assignedDetailTarget.holder
                      ? `${assignedDetailTarget.holder}${assignedDetailTarget.role ? ` • ${assignedDetailTarget.role}` : ""}`
                      : "Unassigned"
                  }
                />
                <Info
                  label="Previous holder"
                  value={formatPreviousHolders(assignedDetailTarget)}
                />
                <Info label="Storage" value={assignedDetailTarget.storageName} />
                <Info
                  label="Status"
                  value={`${assignedDetailTarget.assetStatus} • ${assignedDetailTarget.conditionStatus}`}
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[14px] font-semibold text-[#0f172a]">Assignment history</p>
              {getVisibleSessions(assignedDetailTarget).length > 0 ? (
                getVisibleSessions(assignedDetailTarget).map((session, index) => (
                  <HistoryCard
                    key={`${assignedDetailTarget.id}-history-${index}`}
                    session={session}
                    index={index}
                  />
                ))
              ) : (
                <div className="rounded-[12px] border border-dashed border-[#dbe4ee] bg-[#f8fbff] px-4 py-5 text-[12px] text-[#64748b]">
                  No history yet. This asset has not been retrieved before.
                </div>
              )}
            </div>
          </div>
        </ModalFrame>
      ) : null}

      {retrieveTarget ? (
        <ModalFrame title="Retrieve Asset" onClose={() => setRetrieveTarget(null)}>
          <div className="space-y-3">
            <p className="text-[13px] text-[#334155]">
              {retrieveTarget.assetName} ({retrieveTarget.assetCode})
            </p>

            <label className="block text-[12px] text-[#475569]">
              Storage location
              <select
                value={retrieveForm.storageLocation}
                onChange={(event) =>
                  setRetrieveForm((current) => ({
                    ...current,
                    storageLocation: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
              >
                {fallbackStorageLocations(storageLocations).map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-[12px] text-[#475569]">
                Used duration
                <div className="mt-1 flex h-10 w-full items-center rounded-[10px] border border-[#dbe4ee] bg-[#f8fafc] px-3 text-[14px] text-[#0f172a]">
                  {retrieveForm.usageYears || "-"}
                </div>
              </label>

              <label className="block text-[12px] text-[#475569]">
                Condition
                <select
                  value={retrieveForm.returnCondition}
                  onChange={(event) =>
                    setRetrieveForm((current) => ({
                      ...current,
                      returnCondition: event.target.value,
                    }))
                  }
                  className="mt-1 h-10 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
                >
                  <option>Good</option>
                  <option>Damaged</option>
                  <option>Torn</option>
                  <option>Worn</option>
                </select>
              </label>
            </div>

            <label className="block text-[12px] text-[#475569]">
              Working status
              <select
                value={retrieveForm.returnPower}
                onChange={(event) =>
                  setRetrieveForm((current) => ({
                    ...current,
                    returnPower: event.target.value,
                  }))
                }
                className="mt-1 h-10 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none"
              >
                <option>Working</option>
                <option>Not working</option>
              </select>
            </label>

            <label className="block text-[12px] text-[#475569]">
              Note
              <textarea
                value={retrieveForm.note}
                onChange={(event) =>
                  setRetrieveForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                rows={3}
                className="mt-1 w-full rounded-[10px] border border-[#dbe4ee] bg-white px-3 py-2 text-[14px] text-[#0f172a] outline-none"
                placeholder="Return note"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRetrieveTarget(null)}
                className="rounded-[8px] border border-[#d7e4f2] px-4 py-2 text-[14px] text-[#334155]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleRetrieveConfirm()}
                disabled={isRetrieving}
                className="rounded-[8px] bg-[#dc2626] px-4 py-2 text-[14px] font-medium text-white disabled:opacity-60"
              >
                {isRetrieving ? "Retrieving..." : "Confirm retrieval"}
              </button>
            </div>
          </div>
        </ModalFrame>
      ) : null}

    </WorkspaceShell>
  );
}

function calculateUsageYearsDisplay(distributedAt?: string | null) {
  if (!distributedAt) {
    return "";
  }

  const start = new Date(distributedAt);
  const end = new Date();
  if (Number.isNaN(start.getTime()) || end <= start) {
    return "";
  }

  const totalDays = Math.max(1, Math.floor((end.getTime() - start.getTime()) / 86_400_000));
  if (totalDays < 30) return `${totalDays} day`;
  if (totalDays < 365) return `${Math.floor(totalDays / 30)} mo`;
  return `${(totalDays / 365).toFixed(1).replace(/\\.0$/, "")} yr`;
}

function matchesAdvancedFilters(
  item: DistributionItem,
  filters: {
    selectedRole: string;
    selectedEmployee: string;
    selectedCategory: string;
    selectedType: string;
  },
) {
  const matchesRole =
    filters.selectedRole === "All roles" ||
    item.role === filters.selectedRole ||
    item.sessions.some((session) => session.role === filters.selectedRole);
  const matchesEmployee =
    filters.selectedEmployee === "All employees" ||
    item.holder === filters.selectedEmployee ||
    item.sessions.some((session) => session.holder === filters.selectedEmployee);
  const matchesCategory =
    filters.selectedCategory === "All categories" ||
    item.category === filters.selectedCategory;
  const matchesType =
    filters.selectedType === "All types" ||
    item.itemType === filters.selectedType;

  return matchesRole && matchesEmployee && matchesCategory && matchesType;
}

function getVisibleSessions(item: DistributionItem) {
  return item.holder
    ? item.sessions
    : item.sessions.filter((session) => session.returnedAt !== "-");
}

function formatPreviousHolders(item: DistributionItem) {
  const previousSessions = getVisibleSessions(item);
  if (previousSessions.length === 0) {
    return "No previous holder";
  }

  return previousSessions
    .map(
      (session, index) =>
        `${index + 1}. ${session.holder}${session.role ? ` | ${session.role}` : ""}`,
    )
    .join("\n");
}

function ModalFrame(props: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/45 p-4">
      <div className="w-full max-w-[560px] rounded-[16px] border border-[#d8e8ff] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-[18px] font-semibold text-[#0f172a]">{props.title}</h3>
          <button
            type="button"
            onClick={props.onClose}
            className="rounded-[8px] border border-[#d7e4f2] px-3 py-1.5 text-[13px] text-[#475569]"
          >
            Close
          </button>
        </div>
        {props.children}
      </div>
    </div>
  );
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.1em] text-[#64748b]">{props.label}</p>
      <p className="mt-1 whitespace-pre-line text-[13px] text-[#0f172a]">{props.value}</p>
    </div>
  );
}

function HistoryCard(props: { session: DistributionSession; index: number }) {
  const isReturned = props.session.returnedAt !== "-";

  return (
    <div className="rounded-[12px] border border-[#e2e8f0] bg-[#fbfdff] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-[#0f172a]">
            {props.index + 1}. {props.session.holder}
          </p>
          <p className="text-[12px] text-[#64748b]">{props.session.role}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isReturned ? "bg-[#eef2ff] text-[#475569]" : "bg-[#dcfce7] text-[#166534]"
          }`}
        >
          {isReturned ? "Returned" : "Currently assigned"}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Assigned at" value={formatDisplayDate(props.session.assignedAt)} />
        <Info
          label="Returned at"
          value={props.session.returnedAt === "-" ? "Not returned yet" : formatDisplayDate(props.session.returnedAt)}
        />
        <Info label="Used duration" value={props.session.years} />
        <Info label="Condition" value={props.session.condition} />
        <Info label="Working status" value={props.session.power} />
        <Info label="Note" value={props.session.notes} />
      </div>
    </div>
  );
}
