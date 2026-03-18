"use client";

import { useMemo, useState } from "react";
import {
  assignOrderToPerson,
  formatDisplayDate,
  useOrdersStore,
} from "../../_lib/order-store";
import {
  ActionButton,
  Card,
  EmptyState,
  Stat,
  WorkspaceShell,
} from "../shared/WorkspacePrimitives";
import DistributionHeader from "../distribution/DistributionHeader";
import DistributionDashboard from "../distribution/DistributionDashboard";
import DistributionSearchFilter from "../distribution/DistributionSearchFilter";
import DistributionOrder from "../distribution/DistributionOrder";

const assignees = [
  { name: "Bat-Erdene", role: "Employee" },
  { name: "Tsogoo", role: "Employee" },
  { name: "Nomin", role: "Department Lead" },
];

export function HRDistributionSection() {
  const orders = useOrdersStore();
  const readyOrders = orders.filter(
    (order) => order.status === "received_inventory",
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assigneeName, setAssigneeName] = useState(assignees[0].name);
  const [assigneeRole, setAssigneeRole] = useState(assignees[0].role);
  const selectedOrder = useMemo(
    () =>
      readyOrders.find((order) => order.id === selectedId) ??
      readyOrders[0] ??
      null,
    [readyOrders, selectedId],
  );

  if (!selectedOrder) {
    return (
      <div className="w-full">
        <DistributionHeader />
        <DistributionDashboard />
        <DistributionSearchFilter />
        <DistributionOrder />
      </div>
    );
  }

  return (
    <WorkspaceShell
      title="Distribution"
      subtitle="Assign stored goods to employees and other internal recipients."
      actions={<ActionButton variant="light">Generate QR batch</ActionButton>}
      hideHeader
    >
      <DistributionHeader />
      <Card
        title="Ready for assignment"
        trailing={
          <span className="text-[11px] text-[#8fa0ba]">
            {readyOrders.length} order
          </span>
        }
      >
        <div className="space-y-[8px]">
          {readyOrders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => setSelectedId(order.id)}
              className={`flex w-full items-center justify-between rounded-[10px] border px-[12px] py-[12px] text-left text-[12px] ${selectedOrder.id === order.id ? "border-black bg-black text-white" : "border-[#ececec] bg-white text-[#171717]"}`}
            >
              <span>{order.requestNumber}</span>
              <span>{order.storageLocation}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Assign goods">
        <div className="grid grid-cols-4 gap-[12px]">
          <Stat label="Request" value={selectedOrder.requestNumber} />
          <Stat label="Stored at" value={selectedOrder.storageLocation} />
          <Stat
            label="Received date"
            value={formatDisplayDate(
              selectedOrder.receivedAt ?? selectedOrder.requestDate,
            )}
          />
          <Stat label="Recipient" value={assigneeName} accent />
        </div>
        <div className="mt-[14px] grid grid-cols-2 gap-[12px] text-[12px]">
          <label className="flex flex-col gap-[6px]">
            <span>Assign to</span>
            <select
              value={assigneeName}
              onChange={(event) => setAssigneeName(event.target.value)}
              className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]"
            >
              {assignees.map((person) => (
                <option key={person.name} value={person.name}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-[6px]">
            <span>Recipient role</span>
            <select
              value={assigneeRole}
              onChange={(event) => setAssigneeRole(event.target.value)}
              className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px]"
            >
              {assignees.map((person, index) => (
                <option
                  key={`${person.name}-${person.role}-${index}`}
                  value={person.role}
                >
                  {person.role}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-[14px] rounded-[8px] bg-[#f6f6f7] px-[12px] py-[12px] text-[11px] text-[#666]">
          {selectedOrder.items.map((item, index) => (
            <p key={`${item.catalogId}-${index}`}>
              {item.name} · {item.quantity} {item.unit}
            </p>
          ))}
        </div>
        <div className="mt-[16px] flex justify-end">
          <ActionButton
            variant="green"
            onClick={() =>
              assignOrderToPerson({
                orderId: selectedOrder.id,
                assignedTo: assigneeName,
                assignedRole: assigneeRole,
              })
            }
          >
            Assign goods
          </ActionButton>
        </div>
      </Card>
    </WorkspaceShell>
  );
}
