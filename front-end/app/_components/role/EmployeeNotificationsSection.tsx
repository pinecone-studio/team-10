"use client";

import { WorkspaceShell } from "../shared/WorkspacePrimitives";

const notificationItems = [
  {
    id: "notif-1",
    title: "Pickup approved",
    description: "Your second monitor request was approved for collection from Warehouse A.",
    time: "10 min ago",
  },
  {
    id: "notif-2",
    title: "Asset check reminder",
    description: "Please confirm the condition of your assigned laptop before March 25.",
    time: "Today",
  },
  {
    id: "notif-3",
    title: "Swap request updated",
    description: "HR requested extra details for your keyboard replacement request.",
    time: "Yesterday",
  },
] as const;

export function EmployeeNotificationsSection() {
  return (
    <WorkspaceShell
      title="Notifications"
      subtitle="Updates about your assigned assets, requests, and support tickets."
    >
      <div className="space-y-4">
        {notificationItems.map((item) => (
          <div
            key={item.id}
            className="rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0F172A]">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-6 text-[#64748B]">{item.description}</p>
              </div>
              <span className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[12px] font-medium text-[#64748B]">
                {item.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </WorkspaceShell>
  );
}
