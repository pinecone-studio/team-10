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
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import DistributionHeader from "../distribution/DistributionHeader";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

const RECIPIENT_ROLE_OPTIONS = ["Employee", "Department Lead", "IT Admin"] as const;

export function HRDistributionSection() {
  const [records, setRecords] = useState<DistributionRecordDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDirectoryEntryDto[]>([]);
  const [activeView, setActiveView] = useState<"available" | "assigned" | "pending">("available");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedType, setSelectedType] = useState("All types");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [selectedRecipientRole, setSelectedRecipientRole] = useState<(typeof RECIPIENT_ROLE_OPTIONS)[number]>("Employee");
  const [openAssetId, setOpenAssetId] = useState<string | null>(null);
  const [retrievalDrafts, setRetrievalDrafts] = useState<Record<string, RetrievalDraft>>({});
  const [notice, setNotice] = useState("");

  async function reload() {
    const [assets, distributions, employeeDirectory] = await Promise.all([
      fetchStorageAssetsRequest(),
      fetchAssetDistributionsRequest(true),
      fetchEmployeeDirectoryRequest(true),
    ]);
    setStorageAssets(assets);
    setRecords(distributions);
    setEmployees(employeeDirectory);
  }

  useEffect(() => {
    let live = true;
    void Promise.all([
      fetchStorageAssetsRequest(),
      fetchAssetDistributionsRequest(true),
      fetchEmployeeDirectoryRequest(true),
    ]).then(([assets, distributions, employeeDirectory]) => {
      if (!live) return;
      setStorageAssets(assets);
      setRecords(distributions);
      setEmployees(employeeDirectory);
    });

    return () => {
      live = false;
    };
  }, []);

  const effectiveSelectedEmployeeId =
    employees.some((employee) => employee.id === selectedEmployeeId)
      ? selectedEmployeeId
      : employees[0]?.id ?? "";
  const selectedEmployee = employees.find(
    (employee) => employee.id === effectiveSelectedEmployeeId,
  );

  const historyMap = useMemo(() => buildHistoryMap(records), [records]);
  const availableBase = useMemo(
    () =>
      buildAvailableItems(storageAssets, historyMap).filter(
        (asset) =>
          asset.storageName !== "Assigned to employee" &&
          asset.holder === null &&
          asset.assetStatus !== "pendingAssignment",
      ),
    [historyMap, storageAssets],
  );
  const assignedBase = useMemo(() => buildAssignedItems(records), [records]);
  const categoryOptions = useMemo(
    () => ["All categories", ...Array.from(new Set(availableBase.map((asset) => asset.category)))],
    [availableBase],
  );
  const typeOptions = useMemo(
    () => [
      "All types",
      ...Array.from(
        new Set(
          availableBase
            .filter((asset) => selectedCategory === "All categories" || asset.category === selectedCategory)
            .map((asset) => asset.itemType),
        ),
      ),
    ],
    [availableBase, selectedCategory],
  );

  const matchesFilters = (asset: (typeof availableBase)[number]) =>
    (selectedCategory === "All categories" || asset.category === selectedCategory) &&
    (selectedType === "All types" || asset.itemType === selectedType) &&
    matchesAssetQuery(asset, searchValue);

  const available = availableBase.filter(matchesFilters);
  const assigned = assignedBase.filter(matchesFilters);
  const pending = assigned.filter(
    (asset) =>
      asset.holder === (selectedEmployee?.fullName ?? "") &&
      asset.role === selectedRecipientRole,
  );

  async function assign(asset: (typeof available)[number]) {
    if (!selectedEmployee) {
      setNotice("No employee selected.");
      return;
    }

    const result = await assignAssetDistributionRequest({
      assetId: asset.id,
      employeeName: selectedEmployee.fullName,
      recipientRole: selectedRecipientRole,
    });
    setNotice(
      result?.note
        ? `Assignment initiated. ${result.note}`
        : `Assignment initiated for ${selectedEmployee.fullName}. Acknowledgment email sent if configured.`,
    );
    await reload();
  }

  async function retrieve(asset: (typeof assigned)[number]) {
    const draft = draftFor(retrievalDrafts[asset.id]);
    if (!asset.distributionId) return;
    await returnAssetDistributionRequest({
      distributionId: asset.distributionId,
      storageLocation: "Main warehouse / Intake",
      returnCondition: draft.condition,
      returnPower: draft.power,
      note: draft.notes,
    });
    await reload();
  }

  async function sendNotification() {
    const targets = pending.map((asset) => asset.distributionId).filter(Boolean) as string[];
    await Promise.all(
      targets.map((distributionId) => sendDistributionNotificationRequest(distributionId)),
    );
    setNotice(
      targets.length > 0
        ? `Notification sent to ${selectedEmployee?.fullName ?? "employee"}`
        : `No active distribution for ${selectedEmployee?.fullName ?? "employee"}`,
    );
  }

  const controls = (
    <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-2 xl:grid-cols-3">
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee</span><select value={effectiveSelectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Recipient role</span><select value={selectedRecipientRole} onChange={(e) => setSelectedRecipientRole(e.target.value as (typeof RECIPIENT_ROLE_OPTIONS)[number])} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{RECIPIENT_ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Category</span><select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedType("All types"); }} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Type</span><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
      <label className="grid gap-1 text-[12px] text-[#475569] md:col-span-2 xl:col-span-2"><span>Search</span><input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Asset, serial, storage..." className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none" /></label>
    </div>
  );

  const pendingControls = (
    <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-[1fr_1fr_auto]">
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee</span><select value={effectiveSelectedEmployeeId} onChange={(e) => setSelectedEmployeeId(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}</select></label>
      <label className="grid gap-1 text-[12px] text-[#475569]"><span>Recipient role</span><select value={selectedRecipientRole} onChange={(e) => setSelectedRecipientRole(e.target.value as (typeof RECIPIENT_ROLE_OPTIONS)[number])} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{RECIPIENT_ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
      <div className="flex items-end"><button type="button" onClick={() => void sendNotification()} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-4 text-[13px] font-medium text-[#0f172a]">Send notification</button></div>
      {notice ? <p className="text-[12px] text-[#166534] md:col-span-3">{notice}</p> : null}
    </div>
  );

  return (
    <WorkspaceShell hideHeader title="Distribution" subtitle="" contentAlignment="left" contentWidthClassName="max-w-none" outerClassName="pl-[44px] pr-[60px] pt-[60px] pb-[24px]" backgroundClassName="bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_34%,#ffffff_74%)]">
      <DistributionHeader pendingCount={metricStats.pending} inTransitCount={metricStats.inTransit} deliveredCount={metricStats.delivered} signedCount={metricStats.signed} />
    </WorkspaceShell>
  );
}
