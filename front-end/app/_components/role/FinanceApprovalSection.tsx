"use client";

import { useMemo, useState } from "react";
import { reviewFinanceOrder, reviewFinanceOrderItems, StoredOrder, useOrdersStore } from "../../_lib/order-store";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { FinanceApprovalHeader } from "./finance-approval/FinanceApprovalHeader";
import { FinanceApprovalOrderCard } from "./finance-approval/FinanceApprovalOrderCard";
import { FinanceApprovalRecent } from "./finance-approval/FinanceApprovalRecent";
import {
  countReadyOrders,
  countNeedsDecisionOrders,
  filterPendingOrders,
  filterOrdersByQueueTab,
  getItemDecision,
  summarizeDecisions,
  type DecisionState,
  type ItemDecision,
  type QueueTab,
} from "./finance-approval/utils";

export function FinanceApprovalSection() {
  const orders = useOrdersStore();
  const pendingOrders = useMemo(() => orders.filter((order) => order.status === "pending_finance"), [orders]);
  const processedOrders = useMemo(() => orders.filter((order) => order.financeReviewedAt).slice(0, 6), [orders]);
  const [searchValue, setSearchValue] = useState("");
  const [activeTab, setActiveTab] = useState<QueueTab>("all");
  const [decisionState, setDecisionState] = useState<DecisionState>({});
  const filteredPendingOrders = useMemo(() => filterPendingOrders(pendingOrders, searchValue), [pendingOrders, searchValue]);
  const visibleOrders = useMemo(() => filterOrdersByQueueTab(filteredPendingOrders, decisionState, activeTab), [filteredPendingOrders, decisionState, activeTab]);
  const decisionSummary = useMemo(() => summarizeDecisions(pendingOrders, decisionState), [pendingOrders, decisionState]);

  function setItemDecision(orderId: string, catalogId: string, code: string, decision: ItemDecision) {
    const key = `${catalogId}::${code}`;
    setDecisionState((current) => ({ ...current, [orderId]: { ...(current[orderId] ?? {}), [key]: decision } }));
  }

  async function submitOrder(order: StoredOrder) {
    const decisions = order.items.map((item: { catalogId: string; code: string; }) => ({
      catalogId: item.catalogId,
      code: item.code,
      approved: getItemDecision(decisionState, order.id, item.catalogId, item.code) === "approved",
    }));
    if (decisions.some((item) => getItemDecision(decisionState, order.id, item.catalogId, item.code) === "pending")) return;
    const approvedCount = decisions.filter((item) => item.approved).length;
    if (approvedCount === decisions.length) await reviewFinanceOrder({ orderId: order.id, reviewer: "Finance", approved: true });
    else if (approvedCount === 0) await reviewFinanceOrder({ orderId: order.id, reviewer: "Finance", approved: false });
    else await reviewFinanceOrderItems({ orderId: order.id, reviewer: "Finance", decisions });
    setDecisionState((current) => {
      const nextState = { ...current };
      delete nextState[order.id];
      return nextState;
    });
  }

  return (
    <WorkspaceShell
      title="Finance Approval"
      subtitle="Review new order requests before they move to receiving."
      backgroundClassName="bg-[radial-gradient(circle_at_top_left,#d8ebff_0%,#eef6ff_34%,#ffffff_72%)]"
      contentAlignment="center"
      contentWidthClassName="max-w-[1240px]"
      outerClassName="pl-[44px] pr-[60px] pt-[60px] pb-[24px]"
    >
      <FinanceApprovalHeader
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pendingOrders={pendingOrders.length}
        pendingItems={decisionSummary.pendingCount}
        approvedItems={decisionSummary.approvedCount}
        rejectedItems={decisionSummary.rejectedCount}
        allCount={filteredPendingOrders.length}
        needsDecisionCount={countNeedsDecisionOrders(filteredPendingOrders, decisionState)}
        readyCount={countReadyOrders(filteredPendingOrders, decisionState)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="rounded-[24px] border border-[#dbe8f6] bg-white shadow-[0_18px_42px_rgba(148,163,184,0.16)]">
        <div className="space-y-4 p-4">
          {visibleOrders.length === 0 ? null : visibleOrders.map((order) => (
            <FinanceApprovalOrderCard
              key={order.id}
              order={order}
              decisionState={decisionState}
              onSetDecision={setItemDecision}
              onSubmit={submitOrder}
            />
          ))}
        </div>
        <FinanceApprovalRecent orders={processedOrders} pendingCount={visibleOrders.length} />
      </div>
    </WorkspaceShell>
  );
}
