"use client";

import { formatCurrency, formatDisplayDate, updateOrderStatus, useOrdersStore } from "../../_lib/order-store";
import { ActionButton, Card, EmptyState, Stat, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function FinanceApprovalSection() {
  const orders = useOrdersStore();
  const pendingOrders = orders.filter((order) => order.status === "pending_finance");
  const processedOrders = orders.filter((order) => order.status !== "pending_finance").slice(0, 4);

  return (
    <WorkspaceShell title="Finance approval" subtitle="Review submitted orders and decide whether they can proceed." actions={<ActionButton variant="light">Download summary</ActionButton>}>
      <Card title="Approval queue" trailing={<span className="text-[11px] text-[#8fa0ba]">{pendingOrders.length} pending</span>}>
        <div className="space-y-[12px]">
          {pendingOrders.length > 0 ? pendingOrders.map((order) => (
            <div key={order.id} className="rounded-[10px] border border-[#ececec] px-[14px] py-[14px]">
              <div className="grid grid-cols-4 gap-[12px]">
                <Stat label="Request number" value={order.requestNumber} />
                <Stat label="Requester" value={order.requester} />
                <Stat label="Department" value={order.department} />
                <Stat label="Delivery date" value={formatDisplayDate(order.deliveryDate)} />
              </div>
              <div className="mt-[12px] grid grid-cols-2 gap-[12px]"><Stat label="Total goods" value={`${order.items.length} type`} /><Stat label="Total amount" value={formatCurrency(order.totalAmount)} accent /></div>
              <div className="mt-[14px] rounded-[8px] bg-[#f6f6f7] px-[12px] py-[12px]">{order.items.map((item, index) => <div key={`${order.id}-${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_0.8fr] gap-[10px] py-[4px] text-[11px] text-[#5f5f5f]"><span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span></div>)}</div>
              <div className="mt-[16px] flex gap-[10px]"><ActionButton variant="green" onClick={() => updateOrderStatus(order.id, "approved_finance")}>Approve</ActionButton><ActionButton variant="light" onClick={() => updateOrderStatus(order.id, "rejected_finance")}>Reject</ActionButton></div>
            </div>
          )) : <EmptyState title="No pending finance approvals" description="New orders from Inventory Head will appear here for approval." />}
        </div>
      </Card>
      <Card title="Recent decisions">
        <div className="space-y-[10px]">{processedOrders.map((order) => <div key={order.id} className="flex items-center justify-between rounded-[8px] border border-[#ececec] px-[12px] py-[12px] text-[12px]"><div><p className="font-semibold text-[#171717]">{order.requestNumber}</p><p className="mt-[2px] text-[#8a8a8a]">{order.requester} · {formatDisplayDate(order.requestDate)}</p></div><span className={order.status === "rejected_finance" ? "text-[#ff6b00]" : "text-[#149b63]"}>{order.status === "rejected_finance" ? "Rejected" : order.status === "assigned_hr" ? "Assigned" : "Approved"}</span></div>)}</div>
      </Card>
    </WorkspaceShell>
  );
}
