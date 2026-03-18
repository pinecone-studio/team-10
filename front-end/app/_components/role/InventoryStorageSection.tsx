"use client";

import { useMemo, useState } from "react";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

type Tone = "slate" | "success" | "warning" | "danger" | "info" | "neutral";
type Asset = {
  id: string;
  assetId: string;
  name: string;
  date: string;
  category: string;
  location: string;
  condition: string;
  conditionTone: Tone;
  status: string;
  statusTone: Tone;
  holder: string;
  cost: string;
  department: string;
  type: string;
  quantity: number;
  assigned: number;
  requestId: string;
  requestDate: string;
  summary: string;
};

const actions = ["Dispose", "Census", "Missing", "Audit"] as const;
const categories = [
  ["IT", "Equipment"],
  ["Office", "Equipment"],
  ["Mobile", "Devices"],
  ["Network", "Equipment"],
  ["Furniture", ""],
  ["Other", "Assets"],
] as const;

const assets: Asset[] = [
  {
    id: "1",
    assetId: "23874",
    name: "MacBook Pro 16",
    date: "June 01, 2025",
    category: "Mobile",
    location: "Warehouse A",
    condition: "Damaged",
    conditionTone: "warning",
    status: "Disposal",
    statusTone: "danger",
    holder: "Warehouse A",
    cost: "220,000,000",
    department: "IT Equipment",
    type: "Laptop",
    quantity: 26,
    assigned: 20,
    requestId: "Req-733e-3733e",
    requestDate: "March 18th, 2026",
    summary:
      "These are replacement monitors for the engineering team. The current ones are 5+ years old and experiencing display issues.",
  },
  {
    id: "2",
    assetId: "23875",
    name: "MacBook Pro 16",
    date: "June 01, 2025",
    category: "Mobile",
    location: "Warehouse A",
    condition: "Missing",
    conditionTone: "neutral",
    status: "Disposal",
    statusTone: "danger",
    holder: "Warehouse A",
    cost: "220,000,000",
    department: "IT Equipment",
    type: "Laptop",
    quantity: 12,
    assigned: 8,
    requestId: "Req-512a-1821a",
    requestDate: "March 17th, 2026",
    summary: "Missing from the latest inventory recount and marked for review.",
  },
  {
    id: "3",
    assetId: "23876",
    name: "MacBook Pro 16",
    date: "June 01, 2025",
    category: "Furniture",
    location: "Warehouse A",
    condition: "Good",
    conditionTone: "success",
    status: "Available",
    statusTone: "success",
    holder: "Warehouse A",
    cost: "220,000,000",
    department: "Office Assets",
    type: "Desk",
    quantity: 14,
    assigned: 4,
    requestId: "Req-111a-2200b",
    requestDate: "March 16th, 2026",
    summary: "Available inventory item currently ready for reassignment.",
  },
  {
    id: "4",
    assetId: "23877",
    name: "MacBook Pro 16",
    date: "June 01, 2025",
    category: "Equipment",
    location: "Warehouse A",
    condition: "Damaged",
    conditionTone: "warning",
    status: "Assigned",
    statusTone: "info",
    holder: "Warehouse A",
    cost: "220,000,000",
    department: "IT Equipment",
    type: "Laptop",
    quantity: 7,
    assigned: 3,
    requestId: "Req-830q-1938f",
    requestDate: "March 15th, 2026",
    summary: "Pulled from active use and moved into audit review.",
  },
];

export function InventoryStorageSection() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const asset = useMemo(() => assets.find((item) => item.id === selectedId) ?? null, [selectedId]);

  if (asset) {
    return <AssetDetail asset={asset} onBack={() => setSelectedId(null)} />;
  }

  return (
    <WorkspaceShell hideHeader contentAlignment="left" contentWidthClassName="max-w-none" outerClassName="px-6 py-6" backgroundClassName="bg-[#f6f8fb]" title="" subtitle="">
      <section className="overflow-hidden rounded-[18px] border border-[#d7e5f3] bg-white shadow-[0_14px_40px_rgba(148,163,184,0.14)]">
        <div className="bg-[linear-gradient(180deg,#cfe3fb_0%,#d9ebff_28%,#eef6ff_68%,#ffffff_100%)] px-7 pt-6 pb-5">
          <h1 className="text-[32px] font-semibold tracking-[-0.03em] text-[#0f172a]">Storage Assets</h1>
          <p className="mt-1.5 text-[13px] text-[#64748b]">Manage your inventory stock levels</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <label className="relative min-w-[340px] flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]"><SearchIcon /></span>
              <input className="h-9 w-full rounded-[8px] border border-[#dbe7f3] bg-white/90 pl-9 pr-3 text-[12px] outline-none placeholder:text-[#94a3b8]" placeholder="Search by distribution number, recipient, or department..." />
            </label>
            {actions.map((label) => (
              <button key={label} type="button" className="inline-flex h-8 items-center gap-1.5 rounded-[8px] border border-[#d9e7f2] bg-white/88 px-3 text-[12px] font-medium text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                <PlusIcon />
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-[10px] md:grid-cols-3 xl:grid-cols-6">
            {categories.map(([title, subtitle]) => (
              <div key={`${title}-${subtitle}`} className="rounded-[14px] border border-[#dbe8f5] bg-[linear-gradient(180deg,#f4f9ff_0%,#e7f1fb_100%)] px-4 py-4 shadow-[0_6px_18px_rgba(148,163,184,0.12)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-[12px] font-semibold leading-[1.25] text-[#334155]">
                    <div>{title}</div>
                    {subtitle ? <div>{subtitle}</div> : null}
                  </div>
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[rgba(148,163,184,0.22)] text-[#94a3b8]">
                    <CategoryIcon />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-[22px] pb-2">
          <div className="overflow-hidden rounded-[10px] border border-[#e7edf4] bg-white">
            <div className="grid grid-cols-[28px_54px_1.55fr_1.1fr_1fr_1.1fr_1fr_1fr_1fr_1.05fr_72px] items-center bg-[#f8fbff] px-2 py-[10px] text-[11px] font-medium text-[#475569]">
              <div />
              <span>ID <SortGlyph /></span>
              <span>Asset Name <SortGlyph /></span>
              <span>Date <SortGlyph /></span>
              <span>Category <SortGlyph /></span>
              <span>Location <SortGlyph /></span>
              <span>Condition <SortGlyph /></span>
              <span>Status <SortGlyph /></span>
              <span>Holder <SortGlyph /></span>
              <span>Cost <SortGlyph /></span>
              <div />
            </div>

            <div className="divide-y divide-[#edf2f7]">
              {assets.map((row) => (
                <div key={row.id} className="grid grid-cols-[28px_54px_1.55fr_1.1fr_1fr_1.1fr_1fr_1fr_1fr_1.05fr_72px] items-center px-2 py-[11px] text-[11px] text-[#334155]">
                  <div className="flex items-center justify-center"><input type="checkbox" className="size-[11px] rounded-[3px] border border-[#d0d7e2]" /></div>
                  <span>{row.assetId}</span>
                  <button type="button" onClick={() => setSelectedId(row.id)} className="text-left font-medium text-[#111827] hover:text-[#2563eb]">{row.name}</button>
                  <span>{row.date}</span>
                  <span><Badge tone="slate">{row.category}</Badge></span>
                  <span>{row.location}</span>
                  <span><Badge tone={row.conditionTone}>{row.condition}</Badge></span>
                  <span><Badge tone={row.statusTone}>{row.status}</Badge></span>
                  <span>{row.holder}</span>
                  <span>{row.cost}</span>
                  <div className="relative flex items-center justify-end gap-2">
                    {menuId === row.id ? (
                      <button type="button" onClick={() => { setSelectedId(row.id); setMenuId(null); }} className="rounded-[6px] border border-[#dbe3ee] bg-white px-2 py-1 text-[10px] font-medium text-[#334155] shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                        View Details
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setMenuId((current) => current === row.id ? null : row.id)} className="text-[#94a3b8]"><MoreIcon /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#edf2f7] px-[10px] py-2 text-[10px] text-[#64748b]">
          <span>0 of 68 row(s) selected.</span>
          <div className="flex items-center gap-[18px]">
            <div className="flex items-center gap-2">
              <span>Rows per page</span>
              <button type="button" className="inline-flex h-5 min-w-[42px] items-center justify-between rounded-[6px] border border-[#dbe3ee] bg-white px-[6px] text-[#334155]">10 <ChevronTiny /></button>
            </div>
            <span>Page 1 of 7</span>
            <div className="flex gap-1 text-[#94a3b8]">
              <Pager>{"<<"}</Pager>
              <Pager>{"<"}</Pager>
              <Pager>{">"}</Pager>
              <Pager>{">>"}</Pager>
            </div>
          </div>
        </div>
      </section>
    </WorkspaceShell>
  );
}

function AssetDetail({ asset, onBack }: { asset: Asset; onBack: () => void }) {
  return (
    <WorkspaceShell hideHeader contentAlignment="left" contentWidthClassName="max-w-none" outerClassName="px-6 py-6" backgroundClassName="bg-[#f6f8fb]" title="" subtitle="">
      <section className="overflow-hidden rounded-[18px] border border-[#d7e5f3] bg-white shadow-[0_14px_40px_rgba(148,163,184,0.14)]">
        <div className="bg-[linear-gradient(180deg,#cfe3fb_0%,#d9ebff_28%,#eef6ff_68%,#ffffff_100%)] px-7 pt-6 pb-5">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-[13px] text-[#334155]"><BackIcon /> Back to Storage Assets</button>
          <h1 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-[#0f172a]">Storage</h1>
        </div>

        <div className="grid gap-4 px-7 py-6 xl:grid-cols-[0.95fr_2.05fr]">
          <section className="rounded-[16px] border border-[#d9e6f3] bg-white shadow-[0_12px_24px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e7edf4] px-[18px] py-[16px] text-[24px] font-semibold text-[#0f172a]">Asset Detail</div>
            <div className="px-[18px] py-[16px]">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-semibold text-[#1d4ed8]">BA</div>
                <div>
                  <div className="flex items-center gap-2"><p className="text-[14px] font-semibold text-[#111827]">Storage Team</p><Badge tone="info">Storage</Badge></div>
                  <p className="text-[11px] text-[#64748b]">Storage Coordinator</p>
                </div>
              </div>

              <div className="mt-4 rounded-[14px] bg-[#eef5fc] p-[14px]">
                <div className="grid grid-cols-[70px_1fr] gap-[10px]">
                  <div className="flex h-[90px] items-center justify-center rounded-[10px] border border-[#dce7f2] bg-white"><TowerIcon /></div>
                  <div className="flex h-[90px] items-center justify-center rounded-[10px] border border-[#dce7f2] bg-[linear-gradient(135deg,#35a7ff_0%,#2e5bff_45%,#79d2ff_100%)]"><LaptopPreview /></div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#475569]">{asset.summary}</p>
                <p className="mt-2 text-[10px] text-[#94a3b8]">Mar 14, 11:10 PM</p>
              </div>

              <div className="mt-4 divide-y divide-[#e9eef5] rounded-[12px] border border-[#e7edf4] bg-[#fcfdff]">
                <Info label="Asset ID" value={asset.assetId} />
                <Info label="Asset Name" value={asset.name} />
                <Info label="Department" value={asset.department} />
                <Info label="Type" value={asset.type} />
                <Info label="Location" value={asset.location} />
                <Info label="Condition" value={asset.condition} />
                <Info label="Quantity" value={`${asset.quantity}`} />
                <Info label="Assigned" value={`${asset.assigned}`} strong />
              </div>
            </div>
          </section>

          <section className="rounded-[16px] border border-[#d9e6f3] bg-white shadow-[0_12px_24px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e7edf4] px-[18px] py-[16px] text-[24px] font-semibold text-[#0f172a]">Audit Item</div>
            <div className="space-y-4 px-[18px] py-[16px]">
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Request ID"><ReadonlyField icon={<HashIcon />} value={asset.requestId} /></Field>
                <Field label="Request Date"><SelectLike icon={<CalendarIcon />} value={asset.requestDate} /></Field>
                <Field label="Condition"><SelectLike icon={<ListIcon />} value={asset.condition} /></Field>
                <Field label="Status"><SelectLike icon={<ListIcon />} value={asset.status} /></Field>
              </div>

              <div className="rounded-[14px] border border-[#e4ebf3] bg-white">
                <div className="flex items-center justify-between border-b border-[#edf2f7] px-4 py-3">
                  <h3 className="text-[14px] font-semibold text-[#0f172a]">Value</h3>
                  <span className="rounded-full bg-[#eef4ff] px-2 py-[2px] text-[10px] text-[#2563eb]">{asset.quantity} items</span>
                </div>
                <div className="space-y-[10px] px-4 py-4 text-[13px] text-[#475569]">
                  <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-[#111827]">$1,752.50</span></div>
                  <div className="flex items-center justify-between border-t border-[#edf2f7] pt-[10px] text-[20px] font-semibold text-[#111827]"><span>Total</span><span>$1,752.50</span></div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Field label="Audit Result">
                  <textarea rows={3} placeholder="Add notes for approvers..." className="w-full rounded-[10px] border border-[#d9e5f2] bg-white px-3 py-3 text-[13px] outline-none placeholder:text-[#94a3b8]" />
                </Field>
                <div>
                  <p className="mb-2 text-[12px] font-medium text-[#334155]">Asset QR</p>
                  <div className="flex min-h-[112px] items-center justify-center rounded-[12px] border border-[#d9e5f2] bg-[#fbfdff]"><QrIcon /></div>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" className="inline-flex h-10 items-center rounded-[10px] bg-[#1f365d] px-[18px] text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(31,54,93,0.18)]">Submit</button>
              </div>

              <div>
                <h3 className="text-[14px] font-semibold text-[#0f172a]">History</h3>
                <div className="mt-3 grid gap-[10px] lg:grid-cols-3">
                  {[
                    { title: "Ordered", owner: "Inventory Team", location: "Vendor" },
                    { title: "Arrived at storage", owner: "Storage", location: "Vendor" },
                    { title: "Held in storage", owner: "Storage", location: "Warehouse B" },
                  ].map((item) => (
                    <div key={item.title} className="rounded-[12px] border border-[#e4ebf3] bg-white p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-semibold text-[#0f172a]">{item.title}</p>
                        <Badge tone="success">Good</Badge>
                      </div>
                      <div className="mt-2.5 space-y-2 text-[11px] text-[#64748b]">
                        <div className="flex justify-between gap-2"><span>Owner</span><span className="text-[#111827]">{item.owner}</span></div>
                        <div className="flex justify-between gap-2"><span>Location</span><span className="text-[#111827]">{item.location}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </WorkspaceShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><p className="mb-2 text-[12px] font-medium text-[#334155]">{label}</p>{children}</label>;
}

function SelectLike({ value, icon }: { value: string; icon: React.ReactNode }) {
  return <div className="flex h-10 items-center justify-between rounded-[10px] border border-[#d9e5f2] bg-white px-3 text-[13px] text-[#111827]"><div className="flex items-center gap-2"><span className="text-[#94a3b8]">{icon}</span><span>{value}</span></div><ChevronTiny /></div>;
}

function ReadonlyField({ value, icon }: { value: string; icon: React.ReactNode }) {
  return <div className="flex h-10 items-center rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-3 text-[13px] text-[#94a3b8]"><div className="flex items-center gap-2"><span>{icon}</span><span>{value}</span></div></div>;
}

function Info({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between gap-3 px-[14px] py-[10px] text-[13px]"><span className="text-[#64748b]">{label}</span><span className={strong ? "font-semibold text-[#111827]" : "text-[#111827]"}>{value}</span></div>;
}

function Badge({ children, tone }: { children: string; tone: Tone }) {
  const className = tone === "success" ? "border-[#bbf7d0] bg-[#effdf3] text-[#15803d]" : tone === "warning" ? "border-[#fde68a] bg-[#fff7e8] text-[#d97706]" : tone === "danger" ? "border-[#fecaca] bg-[#fff1f2] text-[#ef4444]" : tone === "info" ? "border-[#bfdbfe] bg-[#eef4ff] text-[#2563eb]" : tone === "neutral" ? "border-[#dbe4ee] bg-[#f8fafc] text-[#64748b]" : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]";
  return <span className={`inline-flex items-center rounded-full border px-[6px] py-[2px] text-[9px] font-medium leading-none ${className}`}>{children}</span>;
}

function SortGlyph() { return <span className="ml-[2px] text-[#94a3b8]">|↕</span>; }
function Pager({ children }: { children: string }) { return <button type="button" className="inline-flex h-[18px] w-[18px] items-center justify-center rounded-[4px] border border-[#dbe3ee] text-[9px]">{children}</button>; }
function SearchIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6.2" cy="6.2" r="3.7" stroke="currentColor" strokeWidth="1.2" /><path d="M9.1 9.1L11.6 11.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>; }
function PlusIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3.3v9.4M3.3 8h9.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
function MoreIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 3.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6ZM8 8.8a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6ZM8 14.4a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z" fill="currentColor" /></svg>; }
function ChevronTiny() { return <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2.5 3.75 5 6.25l2.5-2.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function BackIcon() { return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 7H3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><path d="M6 4.5 3.5 7 6 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function HashIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M5.2 2.8 4.1 13.2M11.9 2.8 10.8 13.2M2.8 6.1h10.4M2.3 9.9h10.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
function CalendarIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="3.5" width="11" height="10" rx="1.4" stroke="currentColor" strokeWidth="1.1" /><path d="M5.1 2.6v2M10.9 2.6v2M2.5 6h11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
function ListIcon() { return <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.3 4.2h9.4M3.3 8h9.4M3.3 11.8h9.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" /></svg>; }
function QrIcon() { return <svg width="92" height="92" viewBox="0 0 92 92" fill="none"><rect width="92" height="92" rx="12" fill="white" /><rect x="10" y="10" width="22" height="22" rx="2" fill="#111827" /><rect x="16" y="16" width="10" height="10" fill="white" /><rect x="60" y="10" width="22" height="22" rx="2" fill="#111827" /><rect x="66" y="16" width="10" height="10" fill="white" /><rect x="10" y="60" width="22" height="22" rx="2" fill="#111827" /><rect x="16" y="66" width="10" height="10" fill="white" /><rect x="42" y="42" width="8" height="8" fill="#111827" /><rect x="54" y="42" width="8" height="8" fill="#111827" /><rect x="42" y="54" width="8" height="8" fill="#111827" /><rect x="54" y="54" width="20" height="8" fill="#111827" /><rect x="42" y="66" width="8" height="8" fill="#111827" /><rect x="60" y="66" width="8" height="8" fill="#111827" /><rect x="72" y="72" width="8" height="8" fill="#111827" /></svg>; }
function TowerIcon() { return <svg width="42" height="62" viewBox="0 0 42 62" fill="none"><rect x="9" y="2" width="24" height="58" rx="3" fill="#2f2f33" /><rect x="12" y="6" width="18" height="6" rx="1.2" fill="#cfd4dc" /><rect x="12" y="15" width="18" height="30" rx="1.4" fill="#585d66" /><path d="M15 20h12M15 25h12M15 30h12M15 35h12M15 40h12" stroke="#cfd4dc" strokeWidth="1" /><circle cx="21" cy="52" r="2" fill="#aab2bf" /></svg>; }
function LaptopPreview() { return <svg width="92" height="58" viewBox="0 0 92 58" fill="none"><rect x="6" y="6" width="80" height="46" rx="4" fill="#d8efff" /><path d="M8 42C18 34 25 24 36 20C50 14 59 19 68 14C75 10 80 7 86 7V48H8V42Z" fill="#60a5fa" /><path d="M7 33C17 35 21 27 31 25C42 22 47 29 58 24C67 20 74 12 86 16V48H7V33Z" fill="#2563eb" /><path d="M0 54H92L84 57H8L0 54Z" fill="#3f3f46" /></svg>; }
function CategoryIcon() { return <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><rect x="2.2" y="2.2" width="7.6" height="7.6" rx="1.2" stroke="currentColor" strokeWidth="1" /><path d="M4 5h4M4 7h4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" /></svg>; }
