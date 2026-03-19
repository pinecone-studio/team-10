"use client";

import { useMemo } from "react";

import { formatDisplayDate, useOrdersStore } from "../../_lib/order-store";

const notificationItems = [
  {
    id: "notif-1",
    title: "Pickup approved",
    description: "Your second monitor request was approved for collection from Warehouse A.",
    time: "10 min ago",
    tone: "blue",
  },
  {
    id: "notif-2",
    title: "Asset check reminder",
    description: "Please confirm the condition of your assigned laptop before March 25.",
    time: "Today",
    tone: "amber",
  },
  {
    id: "notif-3",
    title: "Swap request updated",
    description: "HR requested extra details for your keyboard replacement request.",
    time: "Yesterday",
    tone: "slate",
  },
] as const;

function toneClass(tone: (typeof notificationItems)[number]["tone"]) {
  if (tone === "blue") return "border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]";
  if (tone === "amber") return "border-[#FDE68A] bg-[#FFFBEB] text-[#B45309]";
  return "border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]";
}

export function EmployeeHomeDashboard() {
  const orders = useOrdersStore();
  const assignedOrders = useMemo(
    () => orders.filter((order) => order.status === "assigned_hr"),
    [orders],
  );
  const assignedItems = useMemo(
    () =>
      assignedOrders.flatMap((order) =>
        order.items.map((item, index) => ({
          id: `${order.id}-${item.catalogId}-${index}`,
          orderNumber: order.requestNumber,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          assignedAt: order.assignedAt?.slice(0, 10) ?? order.requestDate,
          holder: order.assignedTo ?? "Batbayar Dorj",
        })),
      ),
    [assignedOrders],
  );

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,#eef6ff_0%,#f8fbff_24%,#ffffff_100%)]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <header className="rounded-[24px] border border-[#DCE7F6] bg-[linear-gradient(135deg,#ffffff_0%,#eef6ff_48%,#f8fbff_100%)] px-6 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#5B84C4]">
            Employee home
          </p>
          <h1 className="mt-2 text-[28px] font-semibold leading-[1.12] tracking-[-0.03em] text-[#0F172A]">
            Overview
          </h1>
          <p className="mt-2 text-[14px] leading-6 text-[#64748B]">
            See your assigned assets and the latest updates.
          </p>
        </header>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <Panel
            title="Assigned assets"
            subtitle="Everything currently issued to you"
            trailing={
              <span className="rounded-full bg-[#EAF2FF] px-3 py-1 text-[12px] font-medium text-[#3363B0]">
                {assignedItems.length} total
              </span>
            }
          >
            {assignedItems.length > 0 ? (
              <div className="space-y-3">
                {assignedItems.map((asset) => (
                  <div
                    key={asset.id}
                    className="flex flex-col gap-3 rounded-[18px] border border-[#E2E8F0] bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)] md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[16px] font-semibold text-[#0F172A]">{asset.name}</h3>
                        <span className="rounded-full bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#64748B]">
                          {asset.orderNumber}
                        </span>
                      </div>
                      <p className="mt-2 text-[14px] text-[#64748B]">
                        {asset.quantity} {asset.unit} assigned to {asset.holder}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-[13px] text-[#475569]">
                      <span className="rounded-full bg-[#EFF6FF] px-3 py-1.5 text-[#1D4ED8]">
                        Assigned {formatDisplayDate(asset.assignedAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyCard
                title="No assigned assets yet"
                description="Assets issued to you by HR or inventory will appear here."
              />
            )}
          </Panel>

          <Panel title="Notifications" subtitle="Recent updates about your requests and assets">
            <div className="space-y-3">
              {notificationItems.map((item) => (
                <article
                  key={item.id}
                  className="rounded-[18px] border border-[#E2E8F0] bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#0F172A]">{item.title}</h3>
                      <p className="mt-2 text-[13px] leading-6 text-[#64748B]">{item.description}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${toneClass(item.tone)}`}>
                      {item.time}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  trailing,
  children,
}: {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-[#E2E8F0] bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#0F172A]">{title}</h2>
          <p className="mt-1 text-[14px] text-[#64748B]">{subtitle}</p>
        </div>
        {trailing}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[18px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC] px-5 py-8 text-center">
      <p className="text-[16px] font-semibold text-[#0F172A]">{title}</p>
      <p className="mt-2 text-[14px] leading-6 text-[#64748B]">{description}</p>
    </div>
  );
}
