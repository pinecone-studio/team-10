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
type RoleName = keyof typeof roster; type AssetState = { holder: string | null; role: RoleName | null; history: string[] }; type RetrievalDraft = { years: string; condition: string; power: string; notes: string }; const stamp = (message: string) => `${new Date().toLocaleString("sv-SE").replace("T", " ").slice(0, 16)} | ${message}`; const splitEntry = (entry: string) => { const [at, ...rest] = entry.split(" | "); return { at: rest.length ? at : "", text: rest.length ? rest.join(" | ") : entry }; };
function summarize(history: string[]) { const owner = [...history].reverse().map(splitEntry).find((item) => item.text.includes("->") && !item.text.includes("Inventory Head")), inspection = [...history].reverse().map(splitEntry).find((item) => item.text.startsWith("Inspection:")), [years = "-", condition = "-", power = "-", notes = "No notes"] = (inspection?.text.replace("Inspection: ", "") ?? "No inspection note").split(" | "); return { owner: owner?.text.split("->").at(-1)?.trim() ?? "No previous holder", years, condition, power, notes, at: inspection?.at ?? owner?.at ?? "-" }; }
function sessions(history: string[]) { const result: { holder: string; assignedAt: string; years: string; condition: string; power: string; notes: string; returnedAt: string }[] = []; for (const raw of history) { const item = splitEntry(raw); if (item.text.includes("->") && !item.text.includes("Inventory Head")) { result.push({ holder: item.text.split("->").at(-1)?.trim() ?? "Unknown", assignedAt: item.at || "-", years: "-", condition: "-", power: "-", notes: "No notes", returnedAt: "-" }); continue; } if (item.text.startsWith("Inspection:")) { const current = result.at(-1); if (!current) continue; const [years = "-", condition = "-", power = "-", notes = "No notes"] = item.text.replace("Inspection: ", "").split(" | "); Object.assign(current, { years, condition, power, notes }); continue; } if (item.text.includes("Inventory Head") && result.length) result[result.length - 1]!.returnedAt = item.at || "-"; } return result.reverse(); }
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

  function assign(asset: StorageAssetDto) {
    setAssetState((current) => {
      const prev = current[asset.id];
      const from = prev?.holder ?? "Storage / Intake";
      return { ...current, [asset.id]: { holder: selectedEmployee, role: selectedRole, history: [...(prev?.history ?? []), stamp(`${from} -> ${selectedEmployee}`)] } };
    });
  }

  function receiveToInventoryHead(asset: StorageAssetDto) {
    setAssetState((current) => {
      const prev = current[asset.id];
      if (!prev?.holder) return current;
      const draft = draftFor(asset.id);
      const summary = `Inspection: ${draft.years || "-"} yr | ${draft.condition} | ${draft.power} | ${draft.notes || "No notes"}`;
      return { ...current, [asset.id]: { holder: null, role: null, history: [...prev.history, stamp(`${prev.holder} -> Inventory Head`), stamp(summary), stamp("Inventory Head -> Available in storage")] } };
    });
  }

  function draftFor(assetId: string) { return retrievalDrafts[assetId] ?? { years: "", condition: "Okay", power: "Working", notes: "" }; }

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

  const pendingControls = <div className="grid gap-3 border-b border-[#edf2f7] px-4 py-4 md:grid-cols-[1fr_1fr_auto]"><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee role</span><select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as RoleName)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{Object.keys(roster).map((role) => <option key={role} value={role}>{role}</option>)}</select></label><label className="grid gap-1 text-[12px] text-[#475569]"><span>Employee</span><select value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-3 text-[14px] text-[#0f172a] outline-none">{roster[selectedRole].map((name) => <option key={name} value={name}>{name}</option>)}</select></label><div className="flex items-end"><button type="button" onClick={() => setNotice(`Notification sent to ${selectedEmployee}`)} className="h-10 rounded-[10px] border border-[#dbe4ee] bg-white px-4 text-[13px] font-medium text-[#0f172a]">Send notification</button></div>{notice ? <p className="text-[12px] text-[#166534] md:col-span-3">{notice}</p> : null}</div>;

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
            <button type="button" onClick={() => setActiveView("pending")} className={`rounded-[10px] px-4 py-2 text-[13px] font-medium ${activeView === "pending" ? "bg-white text-[#0f172a] shadow-sm" : "text-[#64748b]"}`}>
              Pending retrieval
            </button>
          </div>
        </div>
        <div className="px-4 py-4">
          {activeView === "available" ? <AssetPanel title={`Available items (${available.length})`} description="Storage dotor bgaa, assign hiigeegui assetuud." items={available} assetState={assetState} actionLabel="Assign" onAction={assign} controls={availableControls} openAssetId={openAssetId} onToggleOpen={setOpenAssetId} /> : activeView === "assigned" ? <AssetPanel title={`Assigned items (${assigned.length})`} description="Assigned assetuudiin delgerengui medeelel." items={assigned} assetState={assetState} actionLabel="" onAction={() => {}} openAssetId={openAssetId} onToggleOpen={setOpenAssetId} /> : <AssetPanel title={`Pending retrieval (${pending.length})`} description="Ehled role, daraa ni employee songood tuhain hund bgaa assetuud deer notes buguulj retrieval hiine." items={pending} assetState={assetState} actionLabel="Open" onAction={(asset) => setOpenAssetId((current) => current === asset.id ? null : asset.id)} controls={pendingControls} openAssetId={openAssetId} draftFor={draftFor} onDraftChange={(id, key, value) => setRetrievalDrafts((current) => ({ ...current, [id]: { ...draftFor(id), [key]: value } }))} onRetrieve={receiveToInventoryHead} onToggleOpen={setOpenAssetId} />}
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
  openAssetId?: string | null;
  draftFor?: (assetId: string) => RetrievalDraft;
  onDraftChange?: (assetId: string, key: keyof RetrievalDraft, value: string) => void;
  onRetrieve?: (asset: StorageAssetDto) => void;
  onToggleOpen?: (value: string | null | ((current: string | null) => string | null)) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff]">
      <div className="border-b border-[#edf2f7] px-4 py-3">
        <p className="text-[15px] font-semibold text-[#0f172a]">{props.title}</p>
        <p className="mt-1 text-[12px] text-[#64748b]">{props.description}</p>
      </div>
      {props.controls}
      <div className="space-y-2 p-3">
        {props.items.length === 0 ? <EmptyState title="No items" description="End list empty baina." /> : props.items.map((asset) => <AssetRow key={asset.id} asset={asset} state={props.assetState[asset.id]} actionLabel={props.actionLabel} onAction={props.onAction} open={props.openAssetId === asset.id} draft={props.draftFor?.(asset.id)} onDraftChange={props.onDraftChange} onRetrieve={props.onRetrieve} onToggleOpen={props.onToggleOpen} />)}
      </div>
    </section>
  );
}

function AssetRow(props: { asset: StorageAssetDto; state?: AssetState; actionLabel: string; onAction: (asset: StorageAssetDto) => void; open?: boolean; draft?: RetrievalDraft; onDraftChange?: (assetId: string, key: keyof RetrievalDraft, value: string) => void; onRetrieve?: (asset: StorageAssetDto) => void; onToggleOpen?: (value: string | null | ((current: string | null) => string | null)) => void }) {
  const good = props.asset.conditionStatus.toLowerCase() === "good";
  const history = props.state?.history ?? ["Storage / Intake"];
  const summary = summarize(history), usageSessions = sessions(history);
  const holderLabel = props.state?.holder ? "Current holder" : "Last holder";
  const holderValue = props.state?.holder ?? summary.owner;
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
          <p className="mt-2 text-[12px] text-[#475569]">{holderLabel}: {holderValue}</p>
        </div>
        {props.actionLabel === "Open" ? <button type="button" onClick={() => props.onToggleOpen?.((current) => current === props.asset.id ? null : props.asset.id)} className="rounded-[10px] border border-[#dbe4ee] bg-white px-4 py-2 text-[13px] font-medium text-[#0f172a]">Open</button> : props.actionLabel === "Assign" ? <div className="flex items-center gap-2"><button type="button" onClick={() => props.onToggleOpen?.((current) => current === props.asset.id ? null : props.asset.id)} className="rounded-[10px] border border-[#dbe4ee] bg-white px-4 py-2 text-[13px] font-medium text-[#0f172a]">Detail</button><ActionButton variant="green" onClick={() => props.onAction(props.asset)}>Assign</ActionButton></div> : props.actionLabel ? <ActionButton variant="light" onClick={() => props.onAction(props.asset)}>{props.actionLabel}</ActionButton> : null}
      </div>
      {props.open ? <div className="mt-3 grid gap-3 border-t border-[#eef2f7] pt-3"><div className="grid gap-2">{usageSessions.map((session, index) => <div key={`${props.asset.id}-session-${index}`} className="rounded-[12px] border border-[#e2e8f0] bg-[#f8fafc] p-3"><p className="text-[12px] font-semibold text-[#0f172a]">{session.holder}</p><div className="mt-2 grid gap-2 md:grid-cols-2"><Info label="Used for" value={session.years} /><Info label="Condition" value={session.condition} /><Info label="Power" value={session.power} /><Info label="Assigned at" value={session.assignedAt} /><Info label="Note" value={session.notes} wide /><Info label="Returned at" value={session.returnedAt} wide /></div></div>)}</div>{props.draft ? <div className="grid gap-3 md:grid-cols-2"><input value={props.draft.years} onChange={(e) => props.onDraftChange?.(props.asset.id, "years", e.target.value)} placeholder="How many years used?" className="h-10 rounded-[10px] border border-[#dbe4ee] px-3 text-[13px] outline-none" /><select value={props.draft.condition} onChange={(e) => props.onDraftChange?.(props.asset.id, "condition", e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] px-3 text-[13px] outline-none"><option>Okay</option><option>Damaged</option><option>Torn</option><option>Worn</option></select><select value={props.draft.power} onChange={(e) => props.onDraftChange?.(props.asset.id, "power", e.target.value)} className="h-10 rounded-[10px] border border-[#dbe4ee] px-3 text-[13px] outline-none"><option>Working</option><option>Turns on/off</option><option>Not working</option></select><textarea value={props.draft.notes} onChange={(e) => props.onDraftChange?.(props.asset.id, "notes", e.target.value)} placeholder="Notes: damaged, torn, works well, issue details..." rows={3} className="rounded-[10px] border border-[#dbe4ee] px-3 py-2 text-[13px] outline-none md:col-span-2" /><div className="flex justify-end md:col-span-2"><button type="button" onClick={() => props.onRetrieve?.(props.asset)} className="rounded-[10px] bg-[#dc2626] px-4 py-2 text-[13px] font-semibold text-white">Retrieve</button></div></div> : null}</div> : null}
    </div>
  );
}
const Info = (props: { label: string; value: string; wide?: boolean }) => <div className={`rounded-[10px] bg-[#f8fafc] px-3 py-2 ${props.wide ? "md:col-span-2" : ""}`}><p className="text-[11px] text-[#64748b]">{props.label}</p><p className="mt-1 text-[12px] text-[#0f172a]">{props.value}</p></div>;
