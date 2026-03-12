"use client";

import { formatCurrency, formatDisplayDate, useOrdersStore } from "../../_lib/order-store";
import { Card, EmptyState, Stat, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function InventoryStorageSection() {
  const orders = useOrdersStore();
  const storedOrders = orders.filter(
    (order) => order.status === "received_inventory" || order.status === "assigned_hr",
  );
  const readyForHr = storedOrders.filter((order) => order.status === "received_inventory");
  const totalAssets = storedOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  return (
    <WorkspaceShell
      title="Storage overview"
      subtitle="Inventory Head tracks received purchases and prepares them for HR assignment."
    >
      <Card title="Storage summary">
        <div className="grid grid-cols-4 gap-[12px]">
          <Stat label="Stored orders" value={`${storedOrders.length}`} />
          <Stat label="Stored assets" value={`${totalAssets}`} />
          <Stat label="Ready for HR" value={`${readyForHr.length}`} />
          <Stat label="Storage health" value="Stable" accent />
        </div>
      </Card>

      <Card title="Ready for HR handoff">
        <div className="space-y-[8px]">
          {readyForHr.length > 0 ? (
            readyForHr.map((order) => (
              <div key={order.id} className="rounded-[10px] border border-[#ececec] px-[12px] py-[12px] text-[12px]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#171717]">{order.requestNumber}</p>
                  <span>{order.storageLocation}</span>
                </div>
                <p className="mt-[4px] text-[#8a8a8a]">
                  {order.serialNumbers.length} serial registered · waiting for HR Manager
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[10px] border border-dashed border-[#dddddd] px-[16px] py-[20px] text-center text-[12px] text-[#8b8b8b]">
              Orders received by Inventory Head will move here before HR assignment.
            </div>
          )}
        </div>
      </Card>

      <Card title="Stored purchase list">
        <div className="space-y-[10px]">
          {storedOrders.length > 0 ? (
            storedOrders.map((order) => (
              <div key={order.id} className="rounded-[10px] border border-[#ececec] px-[14px] py-[12px] text-[12px]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#171717]">{order.requestNumber}</p>
                  <span>{order.storageLocation || "Storage pending"}</span>
                </div>
                <p className="mt-[4px] text-[#8a8a8a]">
                  {formatDisplayDate(order.receivedAt ?? order.requestDate)} · {formatCurrency(order.totalAmount)}
                </p>
              </div>
            ))
          ) : (
            <EmptyState
              title="No stored goods yet"
              description="Approved and received purchases will show up here after Inventory Head finishes the receiving step."
            />
          )}
        </div>
      </Card>
    </WorkspaceShell>
  );
}
