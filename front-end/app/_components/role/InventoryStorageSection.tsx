"use client";

import {
  formatCurrency,
  formatDisplayDate,
  useOrdersStore,
} from "../../_lib/order-store";
import {
  Card,
  EmptyState,
  Stat,
  WorkspaceShell,
} from "../shared/WorkspacePrimitives";

export function InventoryStorageSection() {
  const orders = useOrdersStore();
  const storedOrders = orders.filter(
    (order) => order.status === "received_inventory" || order.status === "assigned_hr",
  );
  const readyForHr = storedOrders.filter(
    (order) => order.status === "received_inventory",
  );
  const totalAssets = storedOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
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
              <div
                key={order.id}
                className="rounded-[10px] border border-[#ececec] px-[12px] py-[12px] text-[12px]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#171717]">
                    {order.requestNumber}
                  </p>
                  <span>{order.storageLocation}</span>
                </div>
                <p className="mt-[4px] text-[#8a8a8a]">
                  {order.serialNumbers.length} serial registered - waiting for HR
                  Manager
                </p>
                <div className="mt-[10px] flex flex-wrap gap-[10px]">
                  {order.serialNumbers.slice(0, 4).map((serialNumber) => (
                    <QrCard key={serialNumber} value={serialNumber} />
                  ))}
                </div>
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
              <div
                key={order.id}
                className="rounded-[10px] border border-[#ececec] px-[14px] py-[12px] text-[12px]"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#171717]">
                    {order.requestNumber}
                  </p>
                  <span>{order.storageLocation || "Storage pending"}</span>
                </div>
                <p className="mt-[4px] text-[#8a8a8a]">
                  {formatDisplayDate(order.receivedAt ?? order.requestDate)} -{" "}
                  {formatCurrency(order.totalAmount, order.currencyCode)}
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

function QrCard({ value }: { value: string }) {
  return (
    <div className="rounded-[10px] border border-[#dbe3ee] bg-[#f8fbff] p-[10px]">
      <QrPattern value={value} />
      <p className="mt-[8px] max-w-[88px] truncate text-[10px] font-medium text-[#334155]">
        {value}
      </p>
    </div>
  );
}

function QrPattern({ value }: { value: string }) {
  const cells = Array.from({ length: 81 }, (_, index) => {
    const charCode = value.charCodeAt(index % value.length) || 0;
    return (charCode + index) % 2 === 0;
  });

  return (
    <div className="grid grid-cols-9 gap-px rounded-[6px] bg-white p-1">
      {cells.map((filled, index) => (
        <span
          key={`${value}-${index}`}
          className={`h-2 w-2 rounded-[1px] ${filled ? "bg-[#0f172a]" : "bg-[#dbeafe]"}`}
        />
      ))}
    </div>
  );
}
