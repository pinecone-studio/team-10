"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { fetchStorageAssetsRequest, type StorageAssetDto } from "@/app/(dashboard)/_graphql/storage/storage-api";
import { formatDisplayDate } from "../../_lib/order-store";
import { ActionButton, EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import DistributionHeader from "../distribution/DistributionHeader";

const KEY = "ams-hr-asset-handoffs";
const ASSETS_KEY = "ams-hr-distribution-assets";
const roster = {
  Employee: ["Bat-Erdene", "Tsogoo", "Nomin-Erdene Bat"],
  "Department Lead": ["Nomin", "Tsolmon", "Oyungerel"],
  "IT Admin": ["Anu", "Ganbold"],
} as const;

type RoleName = keyof typeof roster;
type AssetState = { holder: string | null; role: RoleName | null; history: string[] };

export function HRDistributionSection() {
  const [assets, setAssets] = useState<StorageAssetDto[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = window.localStorage.getItem(ASSETS_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? (parsed as StorageAssetDto[]) : [];
    } catch {
      return [];
    }
  });
  const [assetState, setAssetState] = useState<Record<string, AssetState>>({});
  const [activeView, setActiveView] = useState<"available" | "assigned">("available");
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All categories");
  const [selectedType, setSelectedType] = useState("All types");
  const [selectedRole, setSelectedRole] = useState<RoleName>("Employee");
  const [selectedEmployee, setSelectedEmployee] = useState<string>(roster.Employee[0]);

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

    try {
      const saved = window.localStorage.getItem(KEY);
      if (saved) setAssetState(JSON.parse(saved));
    } catch {}
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
  const categoryOptions = ["All categories", ...Array.from(new Set(availableBase.map((asset) => asset.category)))];
  const typeOptions = ["All types", ...Array.from(new Set(availableBase.filter((asset) => selectedCategory === "All categories" || asset.category === selectedCategory).map((asset) => asset.itemType)))];

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

  function assign(asset: StorageAssetDto) {
    setAssetState((current) => {
      const prev = current[asset.id];
      const from = prev?.holder ?? "Storage / Intake";
      return { ...current, [asset.id]: { holder: selectedEmployee, role: selectedRole, history: [...(prev?.history ?? []), `${from} -> ${selectedEmployee}`] } };
    });
  }

  function receiveToInventoryHead(asset: StorageAssetDto) {
    setAssetState((current) => {
      const prev = current[asset.id];
      if (!prev?.holder) return current;
      return { ...current, [asset.id]: { holder: null, role: null, history: [...prev.history, `${prev.holder} -> Inventory Head`, "Inventory Head -> Available in storage"] } };
    });
  }

  const availableControls = (
    <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr]">
      <label className="grid gap-1 text-[12px] text-[#475569]">
        <span>Employee role</span>
        <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as RoleName)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">
          {Object.keys(roster).map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12px] text-[#475569]">
        <span>Employee</span>
        <select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">
          {roster[selectedRole].map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12px] text-[#475569]">
        <span>Category</span>
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setSelectedType("All types"); }} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">
          {categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12px] text-[#475569]">
        <span>Type</span>
        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">
          {typeOptions.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-[12px] text-[#475569] md:col-span-2 xl:col-span-3">
        <span>Search</span>
        <input value={searchValue} onChange={(e) => setSearchValue(e.target.value)} placeholder="Asset, request, serial, storage..." className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none" />
      </label>
    </div>
  );

  return (
    <WorkspaceShell title="Distribution" subtitle="Assign one asset at a time, then receive it back through Inventory Head." backgroundClassName="bg-[#f7fafc]">
      <DistributionHeader />
      <section className="rounded-[18px] border border-[#e2e8f0] bg-white shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
        <div className="border-b border-[#edf2f7] px-4 py-3">
          <div className="inline-flex rounded-[12px] bg-[#f1f5f9] p-1">
            <button type="button" onClick={() => setActiveView("available")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "available" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>
              Available items ({available.length})
            </button>
            <button type="button" onClick={() => setActiveView("assigned")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "assigned" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>
              Assigned items ({assigned.length})
            </button>
          </div>
        </div>
        <div className="px-4 py-4">
          {activeView === "available" ? (
            <AssetPanel title={`Available items (${available.length})`} description="Storage dotor bgaa, assign hiigeegui assetuud." items={available} assetState={assetState} actionLabel="Assign" onAction={assign} controls={availableControls} />
          ) : (
            <AssetPanel title={`Assigned items (${assigned.length})`} description="Assigned assetiig Inventory Head ruu huleelgen uguud, holder neriig hasna." items={assigned} assetState={assetState} actionLabel="Receive to Inventory Head" onAction={receiveToInventoryHead} />
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}

function AssetPanel(props: {
  title: string;
  description: string;
  items: StorageAssetDto[];
  assetState: Record<string, AssetState>;
  actionLabel: string;
  onAction: (asset: StorageAssetDto) => void;
  controls?: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff]">
      <div className="border-b border-[#edf2f7] px-4 py-3">
        <p className="text-[15px] font-semibold text-[#0f172a]">{props.title}</p>
        <p className="mt-1 text-[12px] text-[#64748b]">{props.description}</p>
      </div>
      {props.controls}
      <div className="space-y-2 p-3">
        {props.items.length === 0 ? <EmptyState title="No items" description="End list empty baina." /> : props.items.map((asset) => <AssetRow key={asset.id} asset={asset} state={props.assetState[asset.id]} actionLabel={props.actionLabel} onAction={props.onAction} />)}
      </div>
    </section>
  );
}

function AssetRow(props: { asset: StorageAssetDto; state?: AssetState; actionLabel: string; onAction: (asset: StorageAssetDto) => void }) {
  const good = props.asset.conditionStatus.toLowerCase() === "good";
  const history = props.state?.history.at(-1) ?? "Storage / Intake";
  return (
    <div className="rounded-[14px] border border-[#e5ebf2] bg-white px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#0f172a]">{props.asset.assetName}</p>
          <p className="mt-1 text-[12px] text-[#64748b]">{props.asset.assetCode} | {props.asset.serialNumber ?? "No serial"} | {formatDisplayDate(props.asset.receivedAt)}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#475569]">
            <span className={`rounded-full px-2 py-1 ${good ? "bg-[#e8f7ee] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>{good ? "Good" : "Damaged"}</span>
            <span className="rounded-full bg-[#eef2f7] px-2 py-1">{props.asset.storageName}</span>
            <span className="rounded-full bg-[#eef2f7] px-2 py-1">{props.state?.holder ? `${props.state.holder} | ${props.state.role}` : "Available in storage"}</span>
          </div>
          <p className="mt-2 text-[12px] text-[#475569]">History: {history}</p>
        </div>
        <ActionButton variant={props.actionLabel === "Assign" ? "green" : "light"} onClick={() => props.onAction(props.asset)}>{props.actionLabel}</ActionButton>
      </div>
    </div>
  );
}
