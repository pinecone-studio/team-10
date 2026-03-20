"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignAssetDistributionRequest,
  fetchAssetDistributionsRequest,
  fetchEmployeeDirectoryRequest,
  returnAssetDistributionRequest,
  sendDistributionNotificationRequest,
  type DistributionRecordDto,
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
import DistributionOrder from "../distribution/DistributionOrder";
import {
  buildAssignedItems,
  buildAvailableItems,
  buildHistoryMap,
  buildPendingAcknowledgmentItems,
  matchesAssetQuery,
  type DistributionItem,
} from "../distribution/hrDistributionHelpers";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

const RECIPIENT_ROLE_OPTIONS = ["Employee", "Department Lead", "IT Admin"] as const;
const DEFAULT_STORAGE_LOCATION = "Main warehouse / Intake";

type RetrievalFormState = {
  storageLocation: string;
  returnCondition: string;
  returnPower: string;
  note: string;
};

const DEFAULT_RETRIEVAL_FORM: RetrievalFormState = {
  storageLocation: DEFAULT_STORAGE_LOCATION,
  returnCondition: "Good",
  returnPower: "Working",
  note: "",
};

function normalize(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function matchesDistributionQuery(record: DistributionRecordDto, searchValue: string) {
  const query = searchValue.trim().toLowerCase();
  if (!query) {
    return true;
  }

  return [
    record.id,
    record.assetCode,
    record.assetName,
    record.employeeName,
    record.recipientRole,
    record.currentStorageName ?? "",
    record.assetStatus,
    record.status,
  ].some((value) => value.toLowerCase().includes(query));
}

function matchesDistributionStatus(
  record: DistributionRecordDto,
  selectedStatus: DistributionStatusFilter,
) {
  if (selectedStatus === "All status") {
    return true;
  }

  const distributionStatus = normalize(record.status);
  const assetStatus = normalize(record.assetStatus);

  if (selectedStatus === "Pending signature") {
    return distributionStatus === "pendinghandover" || assetStatus === "pendingassignment";
  }

  if (selectedStatus === "Signed") {
    return distributionStatus === "active" && assetStatus === "assigned";
  }

  if (selectedStatus === "Returned") {
    return (
      distributionStatus === "returned" ||
      Boolean(record.returnedAt) ||
      ["instorage", "available", "received"].includes(assetStatus)
    );
  }

  return assetStatus === "pendingretrieval";
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

  return assetStatus === "pendingretrieval";
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
  const [assignEmployeeId, setAssignEmployeeId] = useState("");
  const [assignRecipientRole, setAssignRecipientRole] =
    useState<(typeof RECIPIENT_ROLE_OPTIONS)[number]>("Employee");
  const [assignNote, setAssignNote] = useState("");
  const [assignTarget, setAssignTarget] = useState<DistributionItem | null>(null);
  const [retrieveTarget, setRetrieveTarget] = useState<DistributionItem | null>(null);
  const [retrieveForm, setRetrieveForm] =
    useState<RetrievalFormState>(DEFAULT_RETRIEVAL_FORM);
  const [detailRow, setDetailRow] = useState<DistributionRecordDto | null>(null);
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

  const availableBase = useMemo(
    () =>
      buildAvailableItems(storageAssets, historyMap).filter(
        (item) => isAssignableAsset(item) && item.holder === null,
      ),
    [historyMap, storageAssets],
  );

  const assignedBase = useMemo(() => buildAssignedItems(records), [records]);

  const pendingRequestBase = useMemo(
    () => buildPendingAcknowledgmentItems(records),
    [records],
  );

  const pendingRetrievalBase = useMemo(
    () => assignedBase.filter((item) => normalize(item.assetStatus) === "pendingretrieval"),
    [assignedBase],
  );

  const availableItems = useMemo(
    () =>
      availableBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) && matchesItemStatus(item, selectedStatus),
      ),
    [availableBase, searchValue, selectedStatus],
  );

  const pendingRequestItems = useMemo(
    () =>
      pendingRequestBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) && matchesItemStatus(item, selectedStatus),
      ),
    [pendingRequestBase, searchValue, selectedStatus],
  );

  const pendingRetrievalItems = useMemo(
    () =>
      pendingRetrievalBase.filter(
        (item) =>
          matchesAssetQuery(item, searchValue) && matchesItemStatus(item, selectedStatus),
      ),
    [pendingRetrievalBase, searchValue, selectedStatus],
  );

  const distributionRows = useMemo(
    () =>
      records.filter(
        (record) =>
          matchesDistributionQuery(record, searchValue) &&
          matchesDistributionStatus(record, selectedStatus),
      ),
    [records, searchValue, selectedStatus],
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
    distributions: distributionRows.length,
    "available-assets": availableItems.length,
    "employee-requests": pendingRequestItems.length,
    "pending-retrieval": pendingRetrievalItems.length,
  };

  const visibleGridItems =
    activeTab === "available-assets"
      ? availableItems
      : activeTab === "employee-requests"
        ? pendingRequestItems
        : pendingRetrievalItems;

  const gridActionLabel =
    activeTab === "available-assets"
      ? "Assign"
      : activeTab === "employee-requests"
        ? "Notify"
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
        employeeName: selectedEmployee.fullName,
        recipientRole: assignRecipientRole,
        note: assignNote.trim() || null,
      });
      setNotice(
        `Assignment started for ${selectedEmployee.fullName}. Acknowledgment email should be sent if SMTP is configured.`,
      );
      setAssignTarget(null);
      setAssignNote("");
      await reload();
      setActiveTab("employee-requests");
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

  async function handleReminder(item: DistributionItem) {
    if (!item.distributionId) {
      return;
    }

    try {
      setErrorMessage(null);
      await sendDistributionNotificationRequest(item.distributionId);
      setNotice(`Reminder sent for ${item.assetCode}.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to send reminder.",
      );
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

    if (activeTab === "employee-requests") {
      void handleReminder(item);
      return;
    }

    setRetrieveTarget(item);
    setRetrieveForm((current) => ({
      ...current,
      storageLocation: current.storageLocation || DEFAULT_STORAGE_LOCATION,
    }));
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
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">
          {activeTab === "distributions" ? (
            <DistributionOrder rows={distributionRows} onViewRow={setDetailRow} />
          ) : (
            <DistributionAssetGrid
              items={visibleGridItems}
              actionLabel={gridActionLabel}
              onAction={handleGridAction}
            />
          )}
        </div>
      </div>

      {assignTarget ? (
        <ModalFrame title="Assign Asset" onClose={() => setAssignTarget(null)}>
          <div className="space-y-3">
            <p className="text-[13px] text-[#334155]">
              {assignTarget.assetName} ({assignTarget.assetCode})
            </p>

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
                  <option>Defective</option>
                  <option>Missing</option>
                </select>
              </label>

              <label className="block text-[12px] text-[#475569]">
                Power
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
                  <option>Turns on/off</option>
                  <option>Not working</option>
                </select>
              </label>
            </div>

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

      {detailRow ? (
        <ModalFrame title="Distribution Detail" onClose={() => setDetailRow(null)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Distribution" value={`DIST-${detailRow.id.slice(-4).toUpperCase()}`} />
            <Info label="Asset" value={`${detailRow.assetName} (${detailRow.assetCode})`} />
            <Info label="Employee" value={detailRow.employeeName} />
            <Info label="Role" value={detailRow.recipientRole || "Employee"} />
            <Info label="Status" value={detailRow.status} />
            <Info label="Asset status" value={detailRow.assetStatus} />
            <Info label="Distributed at" value={detailRow.distributedAt} />
            <Info label="Returned at" value={detailRow.returnedAt || "-"} />
            <Info label="Storage" value={detailRow.currentStorageName || "-"} />
            <Info label="Note" value={detailRow.note || "-"} />
          </div>
        </ModalFrame>
      ) : null}
    </WorkspaceShell>
  );
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
      <p className="mt-1 text-[13px] text-[#0f172a]">{props.value}</p>
    </div>
  );
}
