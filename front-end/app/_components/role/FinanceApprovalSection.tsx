"use client";

import { useMemo, useState } from "react";
import {
  formatCurrency,
  formatDisplayDate,
  reviewFinanceOrder,
  reviewFinanceOrderItems,
  useOrdersStore,
} from "../../_lib/order-store";
import type { StoredOrder } from "../../_lib/order-types";
import { ActionButton, EmptyState, WorkspaceShell } from "../shared/WorkspacePrimitives";

type ItemDecision = "pending" | "approved" | "rejected";

export function FinanceApprovalSection() {
  const orders = useOrdersStore();
  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === "pending_finance"),
    [orders],
  );
  const processedOrders = useMemo(
    () => orders.filter((order) => order.financeReviewedAt).slice(0, 6),
    [orders],
  );
  const [searchValue, setSearchValue] = useState("");
  const [decisionState, setDecisionState] = useState<Record<string, Record<string, ItemDecision>>>(
    {},
  );

  const filteredPendingOrders = useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();
    if (!normalizedQuery) return pendingOrders;

    return pendingOrders.filter((order) =>
      [
        order.requestNumber,
        order.requester,
        order.department,
        ...order.items.flatMap((item) => [item.name, item.code]),
      ].some((value) => value.toLowerCase().includes(normalizedQuery)),
    );
  }, [pendingOrders, searchValue]);

  const decisionSummary = useMemo(() => {
    const approvedCount = pendingOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.filter(
          (item) => getItemDecision(decisionState, order.id, item.catalogId, item.code) === "approved",
        ).length
      );
    }, 0);
    const rejectedCount = pendingOrders.reduce((sum, order) => {
      return (
        sum +
        order.items.filter(
          (item) => getItemDecision(decisionState, order.id, item.catalogId, item.code) === "rejected",
        ).length
      );
    }, 0);

    return {
      approvedCount,
      rejectedCount,
      pendingCount:
        pendingOrders.reduce((sum, order) => sum + order.items.length, 0) -
        approvedCount -
        rejectedCount,
    };
  }, [decisionState, pendingOrders]);

  function setItemDecision(
    orderId: string,
    catalogId: string,
    code: string,
    decision: ItemDecision,
  ) {
    const key = `${catalogId}::${code}`;
    setDecisionState((current) => ({
      ...current,
      [orderId]: {
        ...(current[orderId] ?? {}),
        [key]: decision,
      },
    }));
  }

  function applyDecisionToAll(order: StoredOrder, decision: Exclude<ItemDecision, "pending">) {
    setDecisionState((current) => ({
      ...current,
      [order.id]: Object.fromEntries(
        order.items.map((item) => [`${item.catalogId}::${item.code}`, decision]),
      ),
    }));
  }

  async function submitOrder(order: StoredOrder) {
    const pendingItems = order.items.filter(
      (item) => getItemDecision(decisionState, order.id, item.catalogId, item.code) === "pending",
    );
    if (pendingItems.length > 0) {
      return;
    }

    const decisions = order.items.map((item) => ({
      catalogId: item.catalogId,
      code: item.code,
      approved:
        getItemDecision(decisionState, order.id, item.catalogId, item.code) === "approved",
    }));
    const approvedCount = decisions.filter((item) => item.approved).length;

    if (approvedCount === decisions.length) {
      await reviewFinanceOrder({
        orderId: order.id,
        reviewer: "Finance",
        approved: true,
      });
    } else if (approvedCount === 0) {
      await reviewFinanceOrder({
        orderId: order.id,
        reviewer: "Finance",
        approved: false,
      });
    } else {
      await reviewFinanceOrderItems({
        orderId: order.id,
        reviewer: "Finance",
        decisions,
      });
    }

    setDecisionState((current) => {
      const nextState = { ...current };
      delete nextState[order.id];
      return nextState;
    });
  }

  return (
    <WorkspaceShell
      title="Finance approval"
      subtitle="Review order items one by one before they move to receiving."
      backgroundClassName="bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)]"
    >
      <div className="grid gap-4 md:grid-cols-4">
        <FinanceMetric label="Pending orders" value={String(pendingOrders.length)} tone="blue" />
        <FinanceMetric
          label="Pending items"
          value={String(decisionSummary.pendingCount)}
          tone="slate"
        />
        <FinanceMetric
          label="Marked approve"
          value={String(decisionSummary.approvedCount)}
          tone="green"
        />
        <FinanceMetric
          label="Marked reject"
          value={String(decisionSummary.rejectedCount)}
          tone="orange"
        />
      </div>

      <div className="overflow-hidden rounded-[20px] border border-[#d7e5f3] bg-white shadow-[0_18px_42px_rgba(148,163,184,0.14)]">
        <div className="bg-[linear-gradient(180deg,#cfe3fb_0%,#d9ebff_26%,#eef6ff_68%,#ffffff_100%)] px-6 pb-5 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="fx-group min-w-[280px] flex-1"
              data-filled={searchValue ? "true" : "false"}
            >
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                className="fx-input"
              />
              <span className="fx-highlight" />
              <span className="fx-bar" />
              <span className="fx-label">
                Search by request number, requester, department, item name, or code...
              </span>
            </div>
            <ActionButton variant="light">Download summary</ActionButton>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <QueueChip label="All queue" value={filteredPendingOrders.length} active />
            <QueueChip label="Needs decision" value={decisionSummary.pendingCount} />
            <QueueChip label="Ready to submit" value={countReadyOrders(filteredPendingOrders, decisionState)} />
          </div>
        </div>

        <div className="space-y-5 px-4 pb-5 pt-4">
          {filteredPendingOrders.length === 0 ? (
            <EmptyState
              title="No pending finance approvals"
              description="Higher-up approved orders will appear here for Finance review."
            />
          ) : (
            filteredPendingOrders.map((order) => {
              const orderPendingCount = order.items.filter(
                (item) =>
                  getItemDecision(decisionState, order.id, item.catalogId, item.code) === "pending",
              ).length;
              const orderApprovedCount = order.items.filter(
                (item) =>
                  getItemDecision(decisionState, order.id, item.catalogId, item.code) === "approved",
              ).length;
              const orderRejectedCount = order.items.filter(
                (item) =>
                  getItemDecision(decisionState, order.id, item.catalogId, item.code) === "rejected",
              ).length;

              return (
                <section
                  key={order.id}
                  className="overflow-hidden rounded-[18px] border border-[#dbe7f3] bg-white shadow-[0_8px_22px_rgba(148,163,184,0.10)]"
                >
                  <div className="border-b border-[#e6eef7] bg-[linear-gradient(180deg,#f9fbff_0%,#eef6ff_100%)] px-5 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7c93b2]">
                          Approval Queue
                        </p>
                        <h2 className="mt-2 text-[22px] font-semibold text-[#0f172a]">
                          {order.requestNumber}
                        </h2>
                        <p className="mt-1 text-[13px] text-[#5d7087]">
                          {order.requester} · {order.department} · Delivery{" "}
                          {formatDisplayDate(order.deliveryDate)}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill label={`${order.items.length} item(s)`} tone="blue" />
                        <StatusPill label={`${order.totalAmount.toFixed(2)} ${order.currencyCode}`} tone="slate" />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <CompactInfoPill
                        label="Higher-up reviewer"
                        value={order.higherUpReviewer ?? "Direct to Finance"}
                      />
                      <CompactInfoPill
                        label="Approved at"
                        value={
                          order.higherUpReviewedAt
                            ? formatDisplayDate(order.higherUpReviewedAt.slice(0, 10))
                            : "-"
                        }
                      />
                      <CompactInfoPill
                        label="Requested on"
                        value={formatDisplayDate(order.requestDate)}
                      />
                      <CompactInfoPill
                        label="Order total"
                        value={formatCurrency(order.totalAmount, order.currencyCode)}
                        accent
                      />
                    </div>
                  </div>

                  <div className="px-5 py-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusPill label={`${orderPendingCount} pending`} tone="slate" />
                        <StatusPill label={`${orderApprovedCount} approve`} tone="green" />
                        <StatusPill label={`${orderRejectedCount} reject`} tone="orange" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionButton
                          variant="green"
                          onClick={() => applyDecisionToAll(order, "approved")}
                        >
                          Approve all
                        </ActionButton>
                        <ActionButton
                          variant="warning"
                          onClick={() => applyDecisionToAll(order, "rejected")}
                        >
                          Reject all
                        </ActionButton>
                      </div>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-[16px] border border-[#dbe7f3]">
                      <table className="w-full table-fixed border-separate border-spacing-0 text-[12px] text-[#334155]">
                        <colgroup>
                          <col className="w-[6%]" />
                          <col className="w-[26%]" />
                          <col className="w-[11%]" />
                          <col className="w-[8%]" />
                          <col className="w-[13%]" />
                          <col className="w-[14%]" />
                          <col className="w-[22%]" />
                        </colgroup>
                        <thead>
                          <tr className="bg-[#dfeeff] text-[11px] font-medium text-[#334155]">
                            <th className="rounded-l-[12px] px-3 py-3 text-left">No</th>
                            <th className="px-3 py-3 text-left">Item</th>
                            <th className="px-3 py-3 text-left">Code</th>
                            <th className="px-3 py-3 text-left">Qty</th>
                            <th className="px-3 py-3 text-right">Unit price</th>
                            <th className="px-3 py-3 text-right">Total</th>
                            <th className="rounded-r-[12px] px-3 py-3 text-center">Decision</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, index) => {
                            const decision = getItemDecision(
                              decisionState,
                              order.id,
                              item.catalogId,
                              item.code,
                            );

                            return (
                              <tr key={`${order.id}-${item.catalogId}-${item.code}-${index}`} className="transition hover:bg-[#f8fbff]">
                                <td className="border-t border-[#edf2f7] px-3 py-3 align-middle">
                                  {index + 1}
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 align-middle">
                                  <div>
                                    <p className="font-semibold text-[#0f172a]">{item.name}</p>
                                    <p className="mt-1 text-[11px] text-[#8fa0ba]">{item.unit}</p>
                                  </div>
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 align-middle font-medium text-[#334155]">
                                  {item.code}
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 align-middle">
                                  {item.quantity}
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 text-right align-middle">
                                  {formatCurrency(item.unitPrice, item.currencyCode)}
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 text-right align-middle font-semibold text-[#0f172a]">
                                  {formatCurrency(item.totalPrice, item.currencyCode)}
                                </td>
                                <td className="border-t border-[#edf2f7] px-3 py-3 align-middle">
                                  <div className="mx-auto grid max-w-[168px] grid-cols-2 rounded-[12px] border border-[#dbe3ee] bg-[#fbfdff] p-1">
                                    {[
                                      { value: "approved", label: "Approve" },
                                      { value: "rejected", label: "Reject" },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        type="button"
                                        onClick={() =>
                                          setItemDecision(
                                            order.id,
                                            item.catalogId,
                                            item.code,
                                            option.value as ItemDecision,
                                          )
                                        }
                                        className={`rounded-[10px] px-2 py-2 text-[11px] font-medium transition ${
                                          decision === option.value
                                            ? option.value === "approved"
                                              ? "bg-[#dcfce7] text-[#15803d]"
                                              : "bg-[#ffedd5] text-[#c2410c]"
                                            : "text-[#64748b] hover:bg-[#f1f5f9]"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-[12px] text-[#64748b]">
                        {orderPendingCount > 0
                          ? "Choose approve or reject for each item before submitting."
                          : "All items are decided. Submit to split approved and rejected items automatically."}
                      </p>
                      <ActionButton
                        variant="green"
                        disabled={orderPendingCount > 0}
                        onClick={() => submitOrder(order)}
                      >
                        Submit decisions
                      </ActionButton>
                    </div>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>

      <section className="rounded-[20px] border border-[#d7e5f3] bg-white p-5 shadow-[0_18px_42px_rgba(148,163,184,0.12)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7c93b2]">
              Recent Decisions
            </p>
            <h2 className="mt-2 text-[22px] font-semibold text-[#0f172a]">
              Last reviewed requests
            </h2>
          </div>
          <StatusPill label={`${processedOrders.length} records`} tone="slate" />
        </div>

        <div className="mt-5 overflow-hidden rounded-[16px] border border-[#dbe7f3]">
          {processedOrders.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[16px] font-semibold text-[#0f172a]">No finance decisions yet</p>
              <p className="mt-2 text-[13px] text-[#64748b]">
                Reviewed requests will appear here with their latest status.
              </p>
            </div>
          ) : (
            <table className="w-full table-fixed text-left text-[12px] text-[#334155]">
              <colgroup>
                <col className="w-[24%]" />
                <col className="w-[18%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
              </colgroup>
              <thead className="bg-[#e9f2fd] text-[#47627f]">
                <tr>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Requester</th>
                  <th className="px-4 py-3 font-medium">Reviewed</th>
                  <th className="px-4 py-3 font-medium">Items</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.map((order) => (
                  <tr key={order.id} className="border-t border-[#edf2f7]">
                    <td className="px-4 py-3 align-top">
                      <p className="font-semibold text-[#0f172a]">{order.requestNumber}</p>
                      <p className="mt-1 text-[#8fa0ba]">{order.department}</p>
                    </td>
                    <td className="px-4 py-3 align-top">{order.requester}</td>
                    <td className="px-4 py-3 align-top">
                      {order.financeReviewedAt
                        ? formatDisplayDate(order.financeReviewedAt.slice(0, 10))
                        : "-"}
                    </td>
                    <td className="px-4 py-3 align-top">{order.items.length}</td>
                    <td className="px-4 py-3 align-top">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusPill
                        label={
                          order.status === "rejected_finance"
                            ? "Rejected"
                            : order.status === "assigned_hr"
                              ? "Assigned"
                              : order.status === "received_inventory"
                                ? "Received"
                                : "Approved"
                        }
                        tone={order.status === "rejected_finance" ? "orange" : "green"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </WorkspaceShell>
  );
}

function getItemDecision(
  decisions: Record<string, Record<string, ItemDecision>>,
  orderId: string,
  catalogId: string,
  code: string,
) {
  return decisions[orderId]?.[`${catalogId}::${code}`] ?? "pending";
}

function countReadyOrders(
  orders: StoredOrder[],
  decisions: Record<string, Record<string, ItemDecision>>,
) {
  return orders.filter((order) =>
    order.items.every(
      (item) => getItemDecision(decisions, order.id, item.catalogId, item.code) !== "pending",
    ),
  ).length;
}

function FinanceMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "slate" | "green" | "orange";
}) {
  const toneClassName =
    tone === "green"
      ? "text-[#15803d]"
      : tone === "orange"
        ? "text-[#c2410c]"
        : tone === "slate"
          ? "text-[#334155]"
          : "text-[#2563eb]";

  return (
    <div className="rounded-[12px] border border-[#dce6f3] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-[16px] py-[14px] shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
      <p className="text-[12px] text-[#8fa0ba]">{label}</p>
      <p className={`mt-[6px] text-[22px] font-semibold ${toneClassName}`}>{value}</p>
    </div>
  );
}

function CompactInfoPill({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`min-w-[180px] flex-1 rounded-full border px-4 py-2.5 ${
        accent ? "border-[#bfdbfe] bg-[#eef4ff]" : "border-[#dbe7f3] bg-white/85"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.14em] text-[#8fa0ba]">{label}</p>
      <p className="mt-1 truncate text-[13px] font-semibold text-[#0f172a]">{value}</p>
    </div>
  );
}

function QueueChip({
  label,
  value,
  active = false,
}: {
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] ${
        active
          ? "border-[#93c5fd] bg-white text-[#1d4ed8]"
          : "border-[#dbe3ee] bg-[#f8fbff] text-[#475569]"
      }`}
    >
      <span>{label}</span>
      <span className="rounded-full bg-[rgba(37,99,235,0.10)] px-2 py-[1px] text-[11px] text-[#2563eb]">
        {value}
      </span>
    </div>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "blue" | "slate" | "green" | "orange";
}) {
  const className =
    tone === "green"
      ? "border-[#bbf7d0] bg-[#effdf3] text-[#15803d]"
      : tone === "orange"
        ? "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]"
        : tone === "slate"
          ? "border-[#cbd5e1] bg-[#f8fafc] text-[#475569]"
          : "border-[#bfdbfe] bg-[#eef4ff] text-[#2563eb]";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-medium ${className}`}>
      {label}
    </span>
  );
}
