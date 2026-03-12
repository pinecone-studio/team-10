"use client";

import { formatDisplayDate, useOrdersStore } from "../../_lib/order-store";
import { Card, EmptyState, Stat, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function EmployeeAssetsSection() {
  const orders = useOrdersStore();
  const assignedOrders = orders.filter((order) => order.status === "assigned_hr");

  return (
    <WorkspaceShell title="My assigned assets" subtitle="Goods assigned by HR Manager are shown here.">
      {assignedOrders.length > 0 ? assignedOrders.map((order) => (
        <Card key={order.id} title={order.requestNumber}>
          <div className="grid grid-cols-4 gap-[12px]"><Stat label="Assigned to" value={order.assignedTo ?? "-"} /><Stat label="Role" value={order.assignedRole ?? "-"} /><Stat label="Assigned date" value={formatDisplayDate(order.assignedAt?.slice(0, 10) ?? order.requestDate)} /><Stat label="Status" value="Assigned" accent /></div>
          <div className="mt-[12px] space-y-[6px] text-[12px] text-[#5f5f5f]">{order.items.map((item, index) => <div key={`${item.catalogId}-${index}`}>{item.name} · {item.quantity} {item.unit}</div>)}</div>
        </Card>
      )) : <EmptyState title="No assigned assets yet" description="Assets assigned by HR Manager will appear here." />}
    </WorkspaceShell>
  );
}
