"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDisplayDate, useOrdersStore } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { buildQrToken, inferCategory } from "../receive/receiveData";

const ACTIONS = ["Dispose", "Census", "Missing", "Audit"] as const;
const CATEGORIES = ["IT Equipment", "Office Equipment", "Mobile Devices", "Network Equipment", "Furniture", "Other Assets"] as const;

export function InventoryStorageSection() {
  const orders = useOrdersStore();
  const storedOrders = useMemo(() => orders.filter((order) => order.status === "received_inventory" || order.status === "assigned_hr"), [orders]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = storedOrders.find((order) => order.id === selectedOrderId) ?? null;
  const rows = storedOrders.flatMap((order) =>
    order.items.map((item, index) => ({
      id: `${order.id}-${item.catalogId}-${index}`,
      order,
      item,
      category: inferCategory(item.name),
      qrCount: order.serialNumbers.length,
    })),
  );

  if (selectedOrder) {
    const firstItem = selectedOrder.items[0];
    return (
      <WorkspaceShell title="Storage" subtitle="Audit and control received inventory." backgroundClassName="bg-[linear-gradient(180deg,#e8f3ff_0%,#f7fbff_56%,#ffffff_100%)]">
        <button type="button" onClick={() => setSelectedOrderId(null)} className="mb-4 text-[14px] font-medium text-[#334155]">{"<-"} Back to Storage Assets</button>
        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.65fr]">
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Asset Detail</div>
            <div className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-semibold text-[#2563eb]">ST</div>
                <div>
                  <p className="text-[14px] font-semibold text-[#111827]">Storage Team</p>
                  <p className="text-[11px] text-[#64748b]">Storage Coordinator</p>
                </div>
              </div>
              <div className="rounded-[14px] bg-[#eef5fc] p-4">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-white text-[26px]">QR</div>
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-[linear-gradient(135deg,#35a7ff_0%,#2563eb_52%,#8cd8ff_100%)] text-[15px] font-semibold text-white">{firstItem?.name ?? "Stored Item"}</div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#475569]">{selectedOrder.receivedNote || "Received inventory item now tracked inside storage with generated local QR references."}</p>
                <p className="mt-2 text-[10px] text-[#94a3b8]">{formatDisplayDate(selectedOrder.receivedAt ?? selectedOrder.requestDate)}</p>
              </div>
              <div className="divide-y divide-[#e8eef5] rounded-[12px] border border-[#e6edf5] bg-[#fcfdff]">
                {[
                  ["Asset ID", selectedOrder.id],
                  ["Asset Name", firstItem?.name ?? "-"],
                  ["Department", selectedOrder.department],
                  ["Type", firstItem?.unit ?? "pcs"],
                  ["Location", selectedOrder.storageLocation || "Main warehouse / Intake"],
                  ["Condition", selectedOrder.receivedCondition === "issue" ? "Damaged" : "Good"],
                  ["Quantity", String(firstItem?.quantity ?? 0)],
                  ["Assigned", selectedOrder.status === "assigned_hr" ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 text-[13px]">
                    <span className="text-[#64748b]">{label}</span>
                    <span className="font-medium text-[#111827]">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Audit Item</div>
            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Assigned Auditor" value="Storage Team" />
                <Field label="Request ID" value={selectedOrder.requestNumber} />
                <Field label="Request Date" value={formatDisplayDate(selectedOrder.requestDate)} />
                <Field label="Confirmed Location" value={selectedOrder.storageLocation || "Warehouse B"} />
                <Field label="Condition" value={selectedOrder.receivedCondition === "issue" ? "Defective" : "Good"} />
                <Field label="Status" value={selectedOrder.status === "assigned_hr" ? "Assigned" : "Held in storage"} />
              </div>
              <div className="rounded-[14px] border border-[#e4ebf3] bg-white">
                <div className="flex items-center justify-between border-b border-[#edf2f7] px-4 py-3">
                  <h3 className="text-[14px] font-semibold text-[#0f172a]">Value</h3>
                  <span className="rounded-full bg-[#eef4ff] px-2 py-[2px] text-[10px] text-[#2563eb]">{firstItem?.quantity ?? 0} items</span>
                </div>
                <div className="space-y-2 px-4 py-4 text-[13px] text-[#475569]">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)}</span></div>
                  <div className="flex justify-between"><span>QR Codes</span><span>{selectedOrder.serialNumbers.length}</span></div>
                  <div className="flex justify-between border-t border-[#edf2f7] pt-3 text-[20px] font-semibold text-[#111827]"><span>Total</span><span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)}</span></div>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <label className="block">
                  <p className="mb-2 text-[12px] font-medium text-[#334155]">Audit Result</p>
                  <textarea rows={3} defaultValue={selectedOrder.receivedNote || "Stored after receive flow with verified local QR token."} className="w-full rounded-[10px] border border-[#d9e5f2] bg-white px-3 py-3 text-[13px] outline-none" />
                </label>
                <div>
                  <p className="mb-2 text-[12px] font-medium text-[#334155]">Asset QR</p>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedOrder.serialNumbers.slice(0, 4).map((serial) => (
                      <QrCard key={serial} value={buildQrToken(selectedOrder.id, firstItem?.code ?? "ITEM", serial)} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid gap-3 lg:grid-cols-3">
                {["Ordered", "Arrived at storage", "Held in storage"].map((label) => (
                  <div key={label} className="rounded-[12px] border border-[#e4ebf3] bg-white p-3">
                    <div className="flex items-center justify-between"><p className="text-[12px] font-semibold text-[#0f172a]">{label}</p><span className="rounded-full border border-[#bbf7d0] bg-[#effdf3] px-2 py-[2px] text-[10px] text-[#15803d]">Good</span></div>
                    <div className="mt-2 space-y-2 text-[11px] text-[#64748b]">
                      <div className="flex justify-between"><span>Owner</span><span className="text-[#111827]">Storage</span></div>
                      <div className="flex justify-between"><span>Location</span><span className="text-[#111827]">{selectedOrder.storageLocation || "Warehouse B"}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Storage Assets" subtitle="Manage your inventory stock levels" backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]">
      {rows.length === 0 ? <EmptyState title="No stored goods yet" description="Received items will appear here right after the receive step." /> : (
        <div className="overflow-hidden rounded-[20px] border border-[#d7e5f3] bg-white shadow-[0_18px_42px_rgba(148,163,184,0.14)]">
          <div className="bg-[linear-gradient(180deg,#cfe3fb_0%,#d9ebff_26%,#eef6ff_68%,#ffffff_100%)] px-6 pt-6 pb-5">
            <div className="flex flex-wrap gap-2">
              <input placeholder="Search by distribution number, recipient, or department..." className="h-10 min-w-[260px] flex-1 rounded-[10px] border border-[#dbe7f3] bg-white/90 px-4 text-[12px] outline-none placeholder:text-[#94a3b8]" />
              {ACTIONS.map((action) => <button key={action} type="button" className="h-10 rounded-[10px] border border-[#d9e7f2] bg-white px-4 text-[12px] font-medium text-[#0f172a] shadow-[0_1px_2px_rgba(15,23,42,0.06)]">+ {action}</button>)}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {CATEGORIES.map((category) => <div key={category} className="rounded-[16px] border border-[#dbe8f5] bg-[linear-gradient(180deg,#f4f9ff_0%,#e7f1fb_100%)] px-4 py-4 shadow-[0_6px_18px_rgba(148,163,184,0.12)]"><div className="flex items-start justify-between gap-3"><p className="text-[12px] font-semibold leading-5 text-[#334155]">{category}</p><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[rgba(148,163,184,0.22)] text-[11px] text-[#94a3b8]">□</span></div></div>)}
            </div>
          </div>
          <div className="px-4 pb-3">
            <div className="overflow-hidden rounded-[12px] border border-[#e7edf4] bg-white">
              <div className="grid grid-cols-[42px_88px_1.5fr_112px_116px_118px_108px_108px_110px_80px] items-center bg-[#dfeeff] px-3 py-3 text-[11px] font-medium text-[#334155]">
                <span>No</span><span>ID</span><span>Asset Name</span><span>Date</span><span>Category</span><span>Location</span><span>Condition</span><span>Status</span><span>Cost</span><span />
              </div>
              <div className="divide-y divide-[#edf2f7]">
                {rows.map((row, index) => (
                  <button key={row.id} type="button" onClick={() => setSelectedOrderId(row.order.id)} className="grid w-full grid-cols-[42px_88px_1.5fr_112px_116px_118px_108px_108px_110px_80px] items-center px-3 py-3 text-left text-[11px] text-[#334155] hover:bg-[#f8fbff]">
                    <span>{index + 1}</span>
                    <span>{row.item.code}</span>
                    <span><span className="block font-medium text-[#111827]">{row.item.name}</span><span className="mt-1 block text-[#94a3b8]">{row.order.requestNumber}</span></span>
                    <span>{formatDisplayDate(row.order.receivedAt ?? row.order.requestDate)}</span>
                    <span><span className="inline-flex rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-2 py-[2px] text-[10px]">{row.category}</span></span>
                    <span>{row.order.storageLocation || "Warehouse A"}</span>
                    <span><ToneBadge tone={row.order.receivedCondition === "issue" ? "warning" : "success"}>{row.order.receivedCondition === "issue" ? "Damaged" : "Good"}</ToneBadge></span>
                    <span><ToneBadge tone={row.order.status === "assigned_hr" ? "info" : "neutral"}>{row.order.status === "assigned_hr" ? "Assigned" : "Available"}</ToneBadge></span>
                    <span>{formatCurrency(row.item.totalPrice, row.item.currencyCode)}</span>
                    <span className="text-right text-[16px] text-[#94a3b8]">⋮</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between px-1 pt-3 text-[10px] text-[#64748b]">
              <span>0 of {rows.length} row(s) selected.</span>
              <div className="flex items-center gap-4"><span>Rows per page 10</span><span>Page 1 of 1</span><span>{"< < > >"}</span></div>
            </div>
          </div>
        </div>
      )}
    </WorkspaceShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[10px] border border-[#d9e5f2] bg-white px-3 py-3"><p className="text-[11px] text-[#94a3b8]">{label}</p><p className="mt-1 text-[13px] text-[#111827]">{value}</p></div>;
}

function ToneBadge({ children, tone }: { children: string; tone: "success" | "warning" | "info" | "neutral" }) {
  const styles = tone === "success" ? "border-[#bbf7d0] bg-[#effdf3] text-[#15803d]" : tone === "warning" ? "border-[#fde68a] bg-[#fff7e8] text-[#d97706]" : tone === "info" ? "border-[#bfdbfe] bg-[#eef4ff] text-[#2563eb]" : "border-[#dbe4ee] bg-[#f8fafc] text-[#64748b]";
  return <span className={`inline-flex rounded-full border px-2 py-[2px] text-[10px] ${styles}`}>{children}</span>;
}

function QrCard({ value }: { value: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => ((value.charCodeAt(index % value.length) || 0) + index) % 2 === 0);
  return <div className="rounded-[12px] border border-[#dbe3ee] bg-white p-3"><div className="grid grid-cols-9 gap-px rounded-[8px] bg-[#f8fbff] p-2">{cells.map((filled, index) => <span key={`${value}-${index}`} className={`h-3 w-3 rounded-[1px] ${filled ? "bg-[#0f172a]" : "bg-[#dbeafe]"}`} />)}</div><p className="mt-2 truncate text-[10px] text-[#64748b]">{value}</p></div>;
}
