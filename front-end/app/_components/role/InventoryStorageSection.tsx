"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDisplayDate, useOrdersStore } from "../../_lib/order-store";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";
import { buildQrToken, inferCategory } from "../receive/receiveData";

const ACTIONS = ["Dispose", "Census", "Missing", "Audit"] as const;
const CATEGORIES = ["IT Equipment", "Office Equipment", "Mobile Devices", "Network Equipment", "Furniture", "Other Assets"] as const;
const GRID = "grid grid-cols-[42px_96px_1.45fr_112px_116px_122px_108px_108px_110px_48px]";

export function InventoryStorageSection() {
  const orders = useOrdersStore();
  const storedOrders = useMemo(() => orders.filter((order) => order.status === "received_inventory" || order.status === "assigned_hr"), [orders]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = storedOrders.find((order) => order.id === selectedOrderId) ?? null;
  const groups = storedOrders.map((order) => {
    const assetIds = order.assetIds.length > 0 ? order.assetIds : order.serialNumbers.length > 0 ? order.serialNumbers : [order.id];
    return {
      order,
      assetIds,
      rows: assetIds.map((assetId, index) => ({
        id: `${order.id}-${assetId}-${index}`,
        assetId,
        serialNumber: order.serialNumbers[index] ?? order.serialNumbers[0] ?? assetId,
        item: order.items[0],
        category: inferCategory(order.items[0]?.name ?? "Asset"),
      })),
    };
  });
  const totalRows = groups.reduce((sum, group) => sum + group.rows.length, 0);

  if (selectedOrder) {
    const item = selectedOrder.items[0];
    const assetIds = selectedOrder.assetIds.length > 0 ? selectedOrder.assetIds : selectedOrder.serialNumbers.length > 0 ? selectedOrder.serialNumbers : [selectedOrder.id];
    return (
      <WorkspaceShell title="Storage" subtitle="Audit and control received inventory." backgroundClassName="bg-[linear-gradient(180deg,#e8f3ff_0%,#f7fbff_56%,#ffffff_100%)]">
        <button type="button" onClick={() => setSelectedOrderId(null)} className="mb-4 text-[14px] font-medium text-[#334155]">{"<-"} Back to Storage Assets</button>
        <div className="grid gap-5 xl:grid-cols-[0.85fr_1.65fr]">
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Asset Detail</div>
            <div className="space-y-4 p-5">
              <div className="rounded-[14px] bg-[#eef5fc] p-4">
                <div className="grid grid-cols-[72px_1fr] gap-3">
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-white text-[24px]">QR</div>
                  <div className="flex h-[88px] items-center justify-center rounded-[10px] border border-[#d8e6f3] bg-[linear-gradient(135deg,#35a7ff_0%,#2563eb_52%,#8cd8ff_100%)] px-4 text-center text-[15px] font-semibold text-white">{item?.name ?? "Stored Item"}</div>
                </div>
                <p className="mt-3 text-[11px] leading-5 text-[#475569]">{selectedOrder.receivedNote || "Received inventory item now tracked inside storage with generated local QR references."}</p>
              </div>
              <div className="divide-y divide-[#e8eef5] rounded-[12px] border border-[#e6edf5] bg-[#fcfdff]">
                {[
                  ["Asset ID", assetIds[0] ?? selectedOrder.id],
                  ["Asset Name", item?.name ?? "-"],
                  ["Department", selectedOrder.department],
                  ["Location", selectedOrder.storageLocation || "Main warehouse / Intake"],
                  ["Condition", selectedOrder.receivedCondition === "issue" ? "Damaged" : "Good"],
                  ["Unit Cost", formatCurrency(item?.unitPrice ?? 0, item?.currencyCode ?? "USD")],
                  ["Quantity", String(item?.quantity ?? 0)],
                  ["Assigned", selectedOrder.status === "assigned_hr" ? "Yes" : "No"],
                ].map(([label, value]) => <div key={label} className="flex items-center justify-between px-4 py-3 text-[13px]"><span className="text-[#64748b]">{label}</span><span className="font-medium text-[#111827]">{value}</span></div>)}
              </div>
            </div>
          </section>
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Asset QR Batch</div>
            <div className="space-y-5 p-5">
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Request ID" value={selectedOrder.requestNumber} />
                <Field label="Request Date" value={formatDisplayDate(selectedOrder.requestDate)} />
                <Field label="Stored At" value={selectedOrder.storageLocation || "Warehouse B"} />
              </div>
              <div className="rounded-[14px] border border-[#e4ebf3] bg-white px-4 py-4 text-[13px] text-[#475569]">
                <div className="flex justify-between"><span>Unit Cost</span><span>{formatCurrency(item?.unitPrice ?? 0, item?.currencyCode ?? "USD")}</span></div>
                <div className="mt-2 flex justify-between"><span>Asset Count</span><span>{assetIds.length}</span></div>
                <div className="mt-2 flex justify-between border-t border-[#edf2f7] pt-3 text-[20px] font-semibold text-[#111827]"><span>Order Total</span><span>{formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)}</span></div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {assetIds.slice(0, 6).map((assetId, index) => <QrCard key={assetId} title={assetId} value={buildQrToken(selectedOrder.id, assetId, selectedOrder.serialNumbers[index] ?? assetId)} />)}
              </div>
            </div>
          </section>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell title="Storage Assets" subtitle="Manage your inventory stock levels" backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]">
      {totalRows === 0 ? <EmptyState title="No stored goods yet" description="Received items will appear here right after the receive step." /> : (
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
          <div className="space-y-4 px-4 pb-3">
            <div className={`${GRID} items-center rounded-[12px] border border-[#e7edf4] bg-[#dfeeff] px-3 py-3 text-[11px] font-medium text-[#334155]`}>
              <span>No</span><span>ID</span><span>Asset Name</span><span>Date</span><span>Category</span><span>Location</span><span>Condition</span><span>Status</span><span>Unit Cost</span><span />
            </div>
            {groups.map((group, groupIndex) => (
              <div key={group.order.id} className="overflow-hidden rounded-[14px] border border-[#dbe7f3] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.10)]">
                <div className="flex items-center justify-between border-b border-[#e8eef5] bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] px-4 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-[#0f172a]">{group.order.requestNumber}</p>
                    <p className="mt-1 text-[11px] text-[#64748b]">{group.order.requester} | {group.rows.length} assets | {group.order.storageLocation || "Main warehouse / Intake"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-[#94a3b8]">Order Total</p>
                    <p className="text-[13px] font-semibold text-[#111827]">{formatCurrency(group.order.totalAmount, group.order.currencyCode)}</p>
                  </div>
                </div>
                <div className="divide-y divide-[#edf2f7]">
                  {group.rows.map((row, rowIndex) => (
                    <button key={row.id} type="button" onClick={() => setSelectedOrderId(group.order.id)} className={`${GRID} w-full items-center px-3 py-3 text-left text-[11px] text-[#334155] hover:bg-[#f8fbff]`}>
                      <span>{groupIndex * 100 + rowIndex + 1}</span>
                      <span>{row.assetId}</span>
                      <span><span className="block font-medium text-[#111827]">{row.item?.name ?? "Asset"}</span><span className="mt-1 block text-[#94a3b8]">{group.order.requestNumber}</span></span>
                      <span>{formatDisplayDate(group.order.receivedAt ?? group.order.requestDate)}</span>
                      <span><span className="inline-flex rounded-full border border-[#dbe3ee] bg-[#f8fafc] px-2 py-[2px] text-[10px]">{row.category}</span></span>
                      <span>{group.order.storageLocation || "Warehouse A"}</span>
                      <span><ToneBadge tone={group.order.receivedCondition === "issue" ? "warning" : "success"}>{group.order.receivedCondition === "issue" ? "Damaged" : "Good"}</ToneBadge></span>
                      <span><ToneBadge tone={group.order.status === "assigned_hr" ? "info" : "neutral"}>{group.order.status === "assigned_hr" ? "Assigned" : "Available"}</ToneBadge></span>
                      <span>{formatCurrency(row.item?.unitPrice ?? 0, row.item?.currencyCode ?? "USD")}</span>
                      <span className="text-right text-[16px] text-[#94a3b8]">⋮</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between px-1 pt-3 text-[10px] text-[#64748b]">
              <span>0 of {totalRows} row(s) selected.</span>
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

function QrCard({ title, value }: { title: string; value: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => ((value.charCodeAt(index % value.length) || 0) + index) % 2 === 0);
  return <div className="rounded-[12px] border border-[#dbe3ee] bg-white p-3"><div className="grid grid-cols-9 gap-px rounded-[8px] bg-[#f8fbff] p-2">{cells.map((filled, index) => <span key={`${value}-${index}`} className={`h-3 w-3 rounded-[1px] ${filled ? "bg-[#0f172a]" : "bg-[#dbeafe]"}`} />)}</div><p className="mt-2 truncate text-[11px] font-medium text-[#111827]">{title}</p><p className="mt-1 truncate text-[10px] text-[#64748b]">{value}</p></div>;
}
