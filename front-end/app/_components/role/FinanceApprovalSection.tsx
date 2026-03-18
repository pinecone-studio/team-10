"use client";

import { useMemo, useState } from "react";
import { formatCurrency, formatDisplayDate, reviewFinanceOrderItems, useOrdersStore } from "../../_lib/order-store";
import { buildFeedEvents } from "../order/orderPresentation";
import { EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";

function createItemKey(catalogId: string, code: string, index: number) {
  return `${catalogId}-${code}-${index}`;
}

export function FinanceApprovalSection() {
  const orders = useOrdersStore();
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending_finance" || order.status === "pending_higher_up"),
    [orders],
  );
  const reviewedOrders = useMemo(
    () => orders.filter((order) => order.financeReviewedAt).slice(0, 8),
    [orders],
  );
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(pendingOrders[0]?.id ?? null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const selectedOrder = pendingOrders.find((order) => order.id === selectedOrderId) ?? pendingOrders[0] ?? null;
  const itemRows = selectedOrder?.items.map((item, index) => ({
    key: createItemKey(item.catalogId, item.code, index),
    item,
  })) ?? [];
  const selectedCount = itemRows.filter((row) => selectedKeys.includes(row.key)).length;
  const feedEvents = selectedOrder ? buildFeedEvents(selectedOrder) : [];

  async function handleDecision(approved: boolean) {
    if (!selectedOrder || selectedKeys.length === 0) return;
    await reviewFinanceOrderItems({
      orderId: selectedOrder.id,
      reviewer: "Finance",
      note,
      approvedItemKeys: approved ? selectedKeys : [],
      rejectedItemKeys: approved ? [] : selectedKeys,
    });
    setSelectedKeys([]);
    setNote("");
    setSelectedOrderId(pendingOrders.find((order) => order.id !== selectedOrder.id)?.id ?? null);
  }

  return (
    <WorkspaceShell title="Finance Approval" subtitle="Review, split, and route approved items with full audit visibility." backgroundClassName="bg-[linear-gradient(180deg,#e8f3ff_0%,#f7fbff_56%,#ffffff_100%)]">
      {pendingOrders.length === 0 ? (
        <EmptyState title="No pending finance approvals" description="Higher-up approved orders will appear here for Finance review." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
          <section className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
            <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Approval Queue</div>
            <div className="space-y-3 p-5">
              {pendingOrders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setSelectedKeys([]);
                    setNote("");
                  }}
                  className={`w-full rounded-[14px] border px-4 py-4 text-left ${selectedOrder?.id === order.id ? "border-[#93c5fd] bg-[linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)]" : "border-[#e5e7eb] bg-white"}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[14px] font-semibold text-[#0f172a]">{order.requestNumber}</p>
                      <p className="mt-1 text-[12px] text-[#64748b]">{order.requester} | {order.department}</p>
                    </div>
                    <div className="rounded-full bg-[#eef4ff] px-2 py-[2px] text-[10px] text-[#2563eb]">{order.items.length} items</div>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3 text-[12px] text-[#475569]">
                    <Info label="Delivery" value={formatDisplayDate(order.deliveryDate)} />
                    <Info label="Reviewer" value={order.higherUpReviewer ?? "Direct to Finance"} />
                    <Info label="Total" value={formatCurrency(order.totalAmount, order.currencyCode)} />
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            {selectedOrder ? (
              <div className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
                <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Finance Review Detail</div>
                <div className="space-y-5 p-5">
                  <div className="grid gap-3 md:grid-cols-4">
                    <StatCard label="Request" value={selectedOrder.requestNumber} />
                    <StatCard label="Requester" value={selectedOrder.requester} />
                    <StatCard label="Status" value="Pending finance" />
                    <StatCard label="Total" value={formatCurrency(selectedOrder.totalAmount, selectedOrder.currencyCode)} />
                  </div>
                  <div className="rounded-[14px] border border-[#e6edf5] bg-white">
                    <div className="flex items-center justify-between border-b border-[#edf2f7] px-4 py-3">
                      <div>
                        <p className="text-[14px] font-semibold text-[#0f172a]">Order Items</p>
                        <p className="mt-1 text-[12px] text-[#64748b]">Select items to approve or reject. Unselected items stay pending.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedKeys(selectedKeys.length === itemRows.length ? [] : itemRows.map((row) => row.key))}
                        className="rounded-[8px] border border-[#dbe3ee] bg-white px-3 py-2 text-[12px] font-medium text-[#0f172a]"
                      >
                        {selectedKeys.length === itemRows.length ? "Clear all" : "Select all"}
                      </button>
                    </div>
                    <div className="divide-y divide-[#edf2f7]">
                      {itemRows.map((row) => {
                        const isSelected = selectedKeys.includes(row.key);
                        return (
                          <label key={row.key} className="grid cursor-pointer grid-cols-[36px_1.4fr_100px_90px_110px_120px] items-center px-4 py-3 text-[12px] text-[#334155] hover:bg-[#f8fbff]">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(event) =>
                                setSelectedKeys((current) =>
                                  event.target.checked
                                    ? [...current, row.key]
                                    : current.filter((itemKey) => itemKey !== row.key),
                                )
                              }
                              className="size-4 rounded-[4px] border border-[#d0d5dd] accent-[#111827]"
                            />
                            <div>
                              <p className="font-medium text-[#111827]">{row.item.name}</p>
                              <p className="mt-1 text-[#94a3b8]">{row.item.code}</p>
                            </div>
                            <span>{row.item.quantity}</span>
                            <span>{row.item.unit}</span>
                            <span>{formatCurrency(row.item.unitPrice, row.item.currencyCode)}</span>
                            <span>{formatCurrency(row.item.totalPrice, row.item.currencyCode)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <label className="block">
                      <p className="mb-2 text-[12px] font-medium text-[#334155]">Finance Note</p>
                      <textarea
                        rows={5}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Add rationale for approved or rejected items..."
                        className="w-full rounded-[12px] border border-[#d9e5f2] bg-white px-4 py-3 text-[13px] outline-none"
                      />
                    </label>
                    <div className="rounded-[14px] border border-[#e4ebf3] bg-white p-4">
                      <p className="text-[14px] font-semibold text-[#0f172a]">Selection Summary</p>
                      <div className="mt-3 space-y-2 text-[13px] text-[#475569]">
                        <div className="flex justify-between"><span>Selected items</span><span>{selectedCount}</span></div>
                        <div className="flex justify-between"><span>Pending items</span><span>{itemRows.length - selectedCount}</span></div>
                        <div className="flex justify-between border-t border-[#edf2f7] pt-3 font-semibold text-[#111827]"><span>Decision target</span><span>{selectedCount > 0 ? formatCurrency(itemRows.filter((row) => selectedKeys.includes(row.key)).reduce((sum, row) => sum + row.item.totalPrice, 0), selectedOrder.currencyCode) : "-"}</span></div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <button type="button" onClick={() => void handleDecision(true)} disabled={selectedCount === 0} className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] bg-[#111827] text-[13px] font-medium text-white disabled:opacity-40">Approve Selected</button>
                        <button type="button" onClick={() => void handleDecision(false)} disabled={selectedCount === 0} className="inline-flex h-10 flex-1 items-center justify-center rounded-[10px] border border-[#d0d5dd] bg-white text-[13px] font-medium text-[#111827] disabled:opacity-40">Reject Selected</button>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[14px] border border-[#e4ebf3] bg-white p-4">
                    <p className="text-[14px] font-semibold text-[#0f172a]">History</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      {feedEvents.map((event, index) => (
                        <div key={`${event.actor}-${event.date}-${index}`} className="rounded-[12px] border border-[#e8eef5] bg-[#fcfdff] p-3">
                          <p className="text-[12px] font-semibold text-[#111827]">{event.actor}</p>
                          <p className="mt-1 text-[11px] text-[#64748b]">{event.date}</p>
                          <p className="mt-2 text-[12px] text-[#475569]">{event.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="overflow-hidden rounded-[18px] border border-[#d9e6f3] bg-white shadow-[0_18px_40px_rgba(148,163,184,0.12)]">
              <div className="border-b border-[#e6edf5] px-5 py-4 text-[24px] font-semibold text-[#0f172a]">Recent Decisions</div>
              <div className="space-y-3 p-5">
                {reviewedOrders.length > 0 ? reviewedOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3 text-[12px]">
                    <div>
                      <p className="font-semibold text-[#111827]">{order.requestNumber}</p>
                      <p className="mt-1 text-[#64748b]">{order.requester} | {formatDisplayDate(order.financeReviewedAt?.slice(0, 10) ?? order.requestDate)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-[11px] ${order.status === "rejected_finance" ? "bg-[#fff7e8] text-[#d97706]" : "bg-[#effdf3] text-[#15803d]"}`}>
                      {order.status === "rejected_finance" ? "Rejected" : "Approved"}
                    </span>
                  </div>
                )) : <EmptyState title="No finance decisions yet" description="Approved or rejected item groups will appear here." />}
              </div>
            </div>
          </section>
        </div>
      )}
    </WorkspaceShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[10px] border border-[#e5e7eb] bg-[#fcfdff] px-3 py-3"><p className="text-[11px] text-[#94a3b8]">{label}</p><p className="mt-1 text-[12px] text-[#111827]">{value}</p></div>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[12px] border border-[#dce6f3] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-4 py-4"><p className="text-[12px] text-[#8fa0ba]">{label}</p><p className="mt-2 text-[18px] font-semibold text-[#0f172a]">{value}</p></div>;
}
