"use client";

import { useMemo, useState } from "react";
import {
  formatDisplayDate,
  getTodayDateInputValue,
  receiveInventoryOrder,
  useOrdersStore,
} from "../../_lib/order-store";
import { ActionButton, Card, EmptyState, Stat, WorkspaceShell } from "../shared/WorkspacePrimitives";

export function InventoryReceiveSection() {
  const orders = useOrdersStore();
  const queue = orders.filter((order) => order.status === "approved_finance");
  const completedOrders = orders
    .filter((order) => order.status === "received_inventory" || order.status === "assigned_hr")
    .slice(0, 4);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [receivedDate, setReceivedDate] = useState(getTodayDateInputValue());
  const [condition, setCondition] = useState<"complete" | "issue">("complete");
  const [storageLocation, setStorageLocation] = useState("Aisle A / Rack 02");
  const [receivedNote, setReceivedNote] = useState(
    "Checked quantity, purchase date, and packaging condition.",
  );

  const selectedOrder = useMemo(
    () => queue.find((order) => order.id === selectedId) ?? queue[0] ?? null,
    [queue, selectedId],
  );
  const serialDraft = useMemo(
    () =>
      selectedOrder?.items.flatMap((item, itemIndex) =>
        Array.from({ length: item.quantity }, (_, index) => `${item.code}-${itemIndex + 1}${index + 1}`),
      ) ?? [],
    [selectedOrder],
  );

  if (!selectedOrder) {
    return (
      <WorkspaceShell
        title="Inventory receiving"
        subtitle="Inventory Head receives purchased goods after finance approval."
      >
        <EmptyState
          title="No approved purchase yet"
          description="Finance-approved orders will show up here so Inventory Head can receive and serialize them."
        />
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell
      title="Inventory receiving"
      subtitle="Inventory Head confirms purchased goods, records serials, and moves them into storage."
      actions={<ActionButton variant="light">Export receive sheet</ActionButton>}
    >
      <Card title="Inventory Head responsibility">
        <div className="grid grid-cols-3 gap-[12px]">
          <Stat label="Approved waiting" value={`${queue.length}`} />
          <Stat label="Received today" value={`${completedOrders.length}`} />
          <Stat label="Next handoff" value="HR Manager" accent />
        </div>
      </Card>

      <Card
        title="Approved purchase queue"
        trailing={<span className="text-[11px] text-[#8fa0ba]">{queue.length} order</span>}
      >
        <div className="space-y-[8px]">
          {queue.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedId(order.id)}
              className={`flex w-full items-center justify-between rounded-[10px] border px-[12px] py-[12px] text-left text-[12px] ${
                selectedOrder.id === order.id
                  ? "border-black bg-black text-white"
                  : "border-[#ececec] bg-white text-[#171717]"
              }`}
            >
              <span>{order.requestNumber}</span>
              <span>{order.items.length} item</span>
            </button>
          ))}
        </div>
      </Card>

      <Card title="Receive and serialize">
        <div className="grid grid-cols-4 gap-[12px]">
          <Stat label="Request" value={selectedOrder.requestNumber} />
          <Stat label="Requester" value={selectedOrder.requester} />
          <Stat label="Delivery date" value={formatDisplayDate(selectedOrder.deliveryDate)} />
          <Stat label="Storage target" value={storageLocation} accent />
        </div>
        <div className="mt-[14px] grid grid-cols-2 gap-[12px] text-[12px]">
          <label className="flex flex-col gap-[6px]">
            <span>Received date</span>
            <input value={receivedDate} onChange={(event) => setReceivedDate(event.target.value)} type="date" className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]" />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span>Storage location</span>
            <input value={storageLocation} onChange={(event) => setStorageLocation(event.target.value)} className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]" />
          </label>
          <label className="flex flex-col gap-[6px]">
            <span>Condition</span>
            <select value={condition} onChange={(event) => setCondition(event.target.value as "complete" | "issue")} className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]"><option value="complete">Complete</option><option value="issue">Issue found</option></select>
          </label>
          <label className="flex flex-col gap-[6px]">
            <span>Receive note</span>
            <input value={receivedNote} onChange={(event) => setReceivedNote(event.target.value)} className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]" />
          </label>
        </div>
        <div className="mt-[14px] rounded-[8px] bg-[#f6f6f7] px-[12px] py-[12px]">
          {serialDraft.map((serial) => (
            <span key={serial} className="mb-[6px] mr-[6px] inline-flex rounded-full border border-[#d6d6d6] bg-white px-[8px] py-[4px] text-[10px]">
              {serial}
            </span>
          ))}
        </div>
        <div className="mt-[16px] flex justify-end">
          <ActionButton
            variant="green"
            onClick={() =>
              receiveInventoryOrder({
                orderId: selectedOrder.id,
                receivedAt: receivedDate,
                receivedCondition: condition,
                receivedNote,
                storageLocation,
                serialNumbers: serialDraft,
              })
            }
          >
            Receive into storage
          </ActionButton>
        </div>
      </Card>

      <Card title="Recently received">
        <div className="space-y-[8px]">
          {completedOrders.length > 0 ? (
            completedOrders.map((order) => (
              <div key={order.id} className="rounded-[10px] border border-[#ececec] px-[12px] py-[12px] text-[12px]">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[#171717]">{order.requestNumber}</p>
                  <span>{order.storageLocation || "Stored"}</span>
                </div>
                <p className="mt-[4px] text-[#8a8a8a]">
                  {formatDisplayDate(order.receivedAt ?? order.requestDate)} · {order.serialNumbers.length} serial registered
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[10px] border border-dashed border-[#dddddd] px-[16px] py-[20px] text-center text-[12px] text-[#8b8b8b]">
              Received orders will appear here after Inventory Head completes the checklist.
            </div>
          )}
        </div>
      </Card>
    </WorkspaceShell>
  );
}
