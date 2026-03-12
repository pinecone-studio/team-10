"use client";

import { formatCurrency, formatDisplayDate, reviewHigherUpOrder, useOrdersStore } from "../../_lib/order-store";
import { ActionButton, Card, EmptyState, Stat, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function HigherUpApprovalSection() {
  const orders = useOrdersStore();
  const pendingOrders = orders.filter((order) => order.status === "pending_higher_up");
  const processedOrders = orders.filter((order) => order.higherUpReviewedAt).slice(0, 4);

  return (
    <WorkspaceShell title="Any Higher-ups" subtitle="Approve permission requests before they continue to Finance." actions={<ActionButton variant="light">Download queue</ActionButton>}>
      <Card title="Permission request queue" trailing={<span className="text-[11px] text-[#8fa0ba]">{pendingOrders.length} pending</span>}>
        <div className="space-y-[12px]">
          {pendingOrders.length > 0 ? pendingOrders.map((order) => (
            <div key={order.id} className="rounded-[10px] border border-[#ececec] px-[14px] py-[14px]">
              <div className="grid grid-cols-4 gap-[12px]">
                <Stat label="Request number" value={order.requestNumber} />
                <Stat label="Requester" value={order.requester} />
                <Stat label="Department" value={order.department} />
                <Stat label="Delivery date" value={formatDisplayDate(order.deliveryDate)} />
              </div>
              <div className="mt-[12px] grid grid-cols-2 gap-[12px]"><Stat label="Goods count" value={`${order.items.length} type`} /><Stat label="Total amount" value={formatCurrency(order.totalAmount)} accent /></div>
              <div className="mt-[14px] rounded-[8px] bg-[#f6f6f7] px-[12px] py-[12px]">{order.items.map((item, index) => <div key={`${order.id}-${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-[10px] py-[4px] text-[11px] text-[#5f5f5f]"><span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span></div>)}</div>
              <div className="mt-[16px] flex gap-[10px]"><ActionButton variant="green" onClick={() => reviewHigherUpOrder({ orderId: order.id, reviewer: "Any Higher-ups", approved: true })}>Approve to Finance</ActionButton><ActionButton variant="light" onClick={() => reviewHigherUpOrder({ orderId: order.id, reviewer: "Any Higher-ups", approved: false })}>Reject</ActionButton></div>
            </div>
          )) : <EmptyState title="No pending higher-up requests" description="New permission requests will appear here before Finance review." />}
        </div>
      </Card>
      <Card title="Recent decisions">
        <div className="space-y-[10px]">{processedOrders.map((order) => <div key={order.id} className="flex items-center justify-between rounded-[8px] border border-[#ececec] px-[12px] py-[12px] text-[12px]"><div><p className="font-semibold text-[#171717]">{order.requestNumber}</p><p className="mt-[2px] text-[#8a8a8a]">{order.requester} - {formatDisplayDate(order.requestDate)}</p></div><span className={order.status === "rejected_higher_up" ? "text-[#9a5d5d]" : "text-[#9a5f17]"}>{order.status === "rejected_higher_up" ? "Rejected" : "Forwarded to Finance"}</span></div>)}</div>
      </Card>
    </WorkspaceShell>
  );
}
