"use client";

import { useEffect, useMemo, useState } from "react";
import {
  assignAssetDistributionRequest,
  fetchAssetDistributionsRequest,
  returnAssetDistributionRequest,
  sendDistributionNotificationRequest,
  type DistributionRecordDto,
} from "@/app/(dashboard)/_graphql/distribution/distribution-api";
import {
  fetchStorageAssetsRequest,
  type StorageAssetDto,
} from "@/app/(dashboard)/_graphql/storage/storage-api";
import DistributionHeader from "../distribution/DistributionHeader";
import { HRDistributionAssetPanel } from "../distribution/HRDistributionAssetPanel";
import {
  buildAssignedItems,
  buildAvailableItems,
  buildHistoryMap,
  draftFor,
  matchesAssetQuery,
  type RetrievalDraft,
} from "../distribution/hrDistributionHelpers";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

const roster = {
  Employee: ["Namuun", "Dulguun"],
  "Department Lead": ["Namuun", "Dulguun"],
  "IT Admin": ["Namuun", "Dulguun"],
} as const;

    try {
      const saved = window.localStorage.getItem(ASSETS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as StorageAssetDto[]) : [];
    } catch {
      return [];
    }
  });
  const [assetState, setAssetState] = useState<Record<string, AssetState>>(() => {
    if (typeof window === "undefined") return {};

    try {
      const saved = window.localStorage.getItem(KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [activeView, setActiveView] = useState<"available" | "assigned" | "pending">("available");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedType, setSelectedType] = useState("All types");
  const [selectedRole, setSelectedRole] = useState<RoleName>("Employee");
  const [selectedEmployee, setSelectedEmployee] = useState<string>(roster.Employee[0]);
  const [openAssetId, setOpenAssetId] = useState<string | null>(null), [retrievalDrafts, setRetrievalDrafts] = useState<Record<string, RetrievalDraft>>({}), [notice, setNotice] = useState("");
  useEffect(() => {
    let live = true;

    void fetchStorageAssetsRequest()
      .then((data) => {
        if (!live) return;
        setAssets(data);
        try {
          window.localStorage.setItem(ASSETS_KEY, JSON.stringify(data));
        } catch {}
      })
      .catch(() => live && setAssets((current) => current));
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(assetState));
    } catch {}
  }, [assetState]);

  useEffect(() => {
    setSelectedEmployee(roster[selectedRole][0]);
  }, [selectedRole]);

  const availableBase = assets.filter((asset) => !assetState[asset.id]?.holder);
  const categoryOptions = ["All categories", ...Array.from(new Set(availableBase.map((asset) => asset.category)))], typeOptions = ["All types", ...Array.from(new Set(availableBase.filter((asset) => selectedCategory === "All categories" || asset.category === selectedCategory).map((asset) => asset.itemType)))];

  const filteredAssets = useMemo(() => {
    const q = searchValue.trim().toLowerCase();
    return assets.filter((asset) => {
      if (selectedCategory !== "All categories" && asset.category !== selectedCategory) return false;
      if (selectedType !== "All types" && asset.itemType !== selectedType) return false;
      return !q || [asset.assetName, asset.assetCode, asset.serialNumber ?? "", asset.requestNumber, asset.storageName, asset.category, asset.itemType].some((value) => value.toLowerCase().includes(q));
    });
  }, [assets, searchValue, selectedCategory, selectedType]);

  const available = filteredAssets.filter((asset) => !assetState[asset.id]?.holder);
  const assigned = filteredAssets.filter((asset) => assetState[asset.id]?.holder);
  const pending = assigned.filter((asset) => {
    const state = assetState[asset.id];
    if (!state?.holder) return false;
    if (state.holder !== selectedEmployee) return false;
    return !state.role || state.role === selectedRole;
  });

  useEffect(() => { void reload(); }, []);
  useEffect(() => { setSelectedEmployee(roster[selectedRole][0]); }, [selectedRole]);

  const historyMap = useMemo(() => buildHistoryMap(records), [records]);
  const availableBase = useMemo(() => buildAvailableItems(storageAssets, historyMap), [historyMap, storageAssets]);
  const assignedBase = useMemo(() => buildAssignedItems(records), [records]);
  const categoryOptions = useMemo(() => ["All categories", ...Array.from(new Set(availableBase.map((asset) => asset.category)))], [availableBase]);
  const typeOptions = useMemo(() => ["All types", ...Array.from(new Set(availableBase.filter((asset) => selectedCategory === "All categories" || asset.category === selectedCategory).map((asset) => asset.itemType)))], [availableBase, selectedCategory]);
  const matchesFilters = (asset: (typeof availableBase)[number]) => (selectedCategory === "All categories" || asset.category === selectedCategory) && (selectedType === "All types" || asset.itemType === selectedType) && matchesAssetQuery(asset, searchValue);
  const available = availableBase.filter(matchesFilters);
  const assigned = assignedBase.filter(matchesFilters);
  const pending = assigned.filter((asset) => asset.holder === selectedEmployee && asset.role === selectedRole);

  async function assign(asset: (typeof available)[number]) {
    await assignAssetDistributionRequest({ assetId: asset.id, employeeName: selectedEmployee, recipientRole: selectedRole });
    await reload();
  }

  async function retrieve(asset: (typeof assigned)[number]) {
    const draft = draftFor(retrievalDrafts[asset.id]);
    if (!asset.distributionId) return;
    await returnAssetDistributionRequest({
      distributionId: asset.distributionId,
      storageLocation: "Main warehouse / Intake",
      usageYears: draft.years,
      returnCondition: draft.condition,
      returnPower: draft.power,
      note: draft.notes,
    });
    await reload();
  }

  async function sendNotification() {
    const targets = pending.map((asset) => asset.distributionId).filter(Boolean) as string[];
    await Promise.all(targets.map((distributionId) => sendDistributionNotificationRequest(distributionId)));
    setNotice(targets.length > 0 ? `Notification sent to ${selectedEmployee}` : `No active distribution for ${selectedEmployee}`);
  }

  const controls = <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr]"><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee role</span><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as RoleName)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{Object.keys(roster).map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee</span><select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{roster[selectedRole].map((name) => <option key={name} value={name}>{name}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569]"><span>Category</span><select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedType("All types"); }} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569]"><span>Type</span><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569] md:col-span-2 xl:col-span-3"><span>Search</span><input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Asset, request, serial, storage..." className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none" /></label></div>;
  const pendingControls = <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee role</span><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as RoleName)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{Object.keys(roster).map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee</span><select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{roster[selectedRole].map((name) => <option key={name} value={name}>{name}</option>)}</select></label><div className="flex items-end"><button type="button" onClick={() => void sendNotification()} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-4 text-[13px] font-medium text-[#0f172a]">Send notification</button></div>{notice ? <p className="text-[12px] text-[#166534] md:col-span-3">{notice}</p> : null}</div>;

  return <WorkspaceShell title="Distribution" subtitle="Assign one asset at a time, then receive it back through Inventory Head." backgroundClassName="bg-[#f7fafc]"><DistributionHeader /><section className="rounded-[18px] border border-[#e2e8f0] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]"><div className="border-b border-[#edf2f7] px-4 py-3"><div className="inline-flex rounded-[12px] bg-[#f1f5f9] p-1"><button type="button" onClick={() => setActiveView("available")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "available" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>Available items ({available.length})</button><button type="button" onClick={() => setActiveView("assigned")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "assigned" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>Assigned items ({assigned.length})</button><button type="button" onClick={() => setActiveView("pending")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "pending" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>Pending retrieval</button></div></div><div className="px-4 py-4">{activeView === "available" ? <HRDistributionAssetPanel title={`Available items (${available.length})`} description="Storage dotor bgaa, assign hiigeegui assetuud." items={available} actionLabel="Assign" onAction={(asset) => void assign(asset)} controls={controls} openAssetId={openAssetId} onToggleOpen={setOpenAssetId} /> : activeView === "assigned" ? <HRDistributionAssetPanel title={`Assigned items (${assigned.length})`} description="Assigned assetuudiin delgerengui medeelel." items={assigned} actionLabel="Open" onAction={() => {}} openAssetId={openAssetId} onToggleOpen={setOpenAssetId} /> : <HRDistributionAssetPanel title={`Pending retrieval (${pending.length})`} description="Ehled role, daraa ni employee songood tuhain hund bgaa assetuud deer notes buguulj retrieval hiine." items={pending} actionLabel="Open" onAction={() => {}} controls={pendingControls} openAssetId={openAssetId} draftFor={(assetId) => draftFor(retrievalDrafts[assetId])} onDraftChange={(id, key, value) => setRetrievalDrafts((current) => ({ ...current, [id]: { ...draftFor(current[id]), [key]: value } }))} onRetrieve={(asset) => void retrieve(asset)} onToggleOpen={setOpenAssetId} />}</div></section></WorkspaceShell>;
}
