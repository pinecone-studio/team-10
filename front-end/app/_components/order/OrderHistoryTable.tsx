"use client";

import {
  formatCurrency,
  formatDisplayDate,
  type StoredOrder,
} from "../../_lib/order-store";
import { getOrderSummaryName } from "./orderPresentation";

function SortIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className="h-[15px] w-[15px]"
    >
      <path
        d="M6.875 10.625L4.375 13.125L1.875 10.625"
        stroke="#475569"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.375 13.125V5.625"
        stroke="#475569"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.125 4.375L10.625 1.875L8.125 4.375"
        stroke="#475569"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.625 9.375V1.875"
        stroke="#475569"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: StoredOrder["status"] }) {
  const presentation =
    status === "pending_finance"
      ? {
          label: "Pending Finance",
          tone: "border-[#fde047] bg-[#fef9c3] text-[#ca8a04]",
        }
      : status === "rejected_finance"
        ? {
            label: "Rejected",
            tone: "border-[#fca5a5] bg-[#fee2e2] text-[#dc2626]",
          }
        : status === "approved_finance"
          ? {
              label: "Approved",
              tone: "border-[#93c5fd] bg-[#dbeafe] text-[#2563eb]",
            }
          : status === "received_inventory"
            ? {
                label: "Received",
                tone: "border-[#86efac] bg-[#dcfce7] text-[#16a34a]",
              }
            : {
                label: "Assigned",
                tone: "border-[#cbd5e1] bg-[#f8fafc] text-[#475569]",
              };

  return (
    <span
      className={`inline-flex h-7 w-[98px] items-center justify-center rounded-full border px-3 text-[12px] font-medium leading-none ${presentation.tone}`}
    >
      {presentation.label}
    </span>
  );
}

export function OrderHistoryTable(props: {
  orders: StoredOrder[];
  sortKey:
    | "requestNumber"
    | "orderName"
    | "requester"
    | "requestDate"
    | "status"
    | "totalAmount";
  sortDirection: "asc" | "desc";
  onSortChange: (
    key:
      | "requestNumber"
      | "orderName"
      | "requester"
      | "requestDate"
      | "status"
      | "totalAmount",
  ) => void;
  onOpenDetail: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void | Promise<void>;
}) {
  const hasOrders = props.orders.length > 0;
  const headerButtonClassName =
    "order-sort-trigger inline-flex cursor-pointer items-center gap-1 text-left transition hover:text-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 rounded-[8px]";

  function renderSortableHeader(
    label: string,
    key:
      | "requestNumber"
      | "orderName"
      | "requester"
      | "requestDate"
      | "status"
      | "totalAmount",
    align: "left" | "right" = "left",
  ) {
    const isActive = props.sortKey === key;
    return (
      <button
        type="button"
        onClick={() => props.onSortChange(key)}
        className={`${headerButtonClassName} ${align === "right" ? "justify-end" : ""}`}
      >
        <span>{label}</span>
        <span className={`${isActive ? "opacity-100" : "opacity-55"}`}>
          <SortIcon />
        </span>
      </button>
    );
  }

  return (
    <section className={`flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#e2efff] bg-white px-4 py-5 shadow-[0_14px_34px_rgba(125,170,232,0.12),0_6px_16px_rgba(15,23,42,0.05)] ${hasOrders ? "h-[760px]" : "shrink-0"}`}>
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full min-w-[920px] min-h-0 flex-col">
          <div className="grid grid-cols-[100px_1.35fr_1.2fr_120px_130px_120px_130px] items-center rounded-[10px] border border-[#e3efff] bg-[#eef6ff] px-6 py-5 text-[14px] font-medium text-[#475569]">
            {renderSortableHeader("Order ID", "requestNumber")}
            {renderSortableHeader("Order Name", "orderName")}
            {renderSortableHeader("Requester", "requester")}
            {renderSortableHeader("Date", "requestDate")}
            {renderSortableHeader("Status", "status")}
            <span className="text-center">Action</span>
            {renderSortableHeader("Total Amount", "totalAmount", "right")}
          </div>
          <div className={`mt-5 min-h-0 ${hasOrders ? "flex-1 overflow-y-auto overflow-x-auto pr-1" : ""}`}>
            {hasOrders ? (
              props.orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => props.onOpenDetail(order.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      props.onOpenDetail(order.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="grid w-full grid-cols-[100px_1.35fr_1.2fr_120px_130px_120px_130px] items-center rounded-[6px] border border-[#e3e4e8] bg-white px-6 py-4 text-left transition duration-150 hover:border-[#cbd5e1] hover:bg-[#fcfcfd] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
                >
                  <span className="text-[14px] font-medium text-[#2563eb]">
                    #{order.requestNumber.slice(-6)}
                  </span>
                  <span className="text-[14px] font-medium text-[#475569]">
                    {getOrderSummaryName(order)}
                  </span>
                  <div className="flex items-center gap-[6px] text-[14px] font-medium text-[#475569]">
                    <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e2e8f0] px-[5px] text-[10px] font-normal text-[#2563eb]">
                      {(order.requester || "R").slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate">{order.requester || "Unknown requester"}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#475569]">
                    {formatDisplayDate(order.requestDate)}
                  </span>
                  <StatusBadge status={order.status} />
                  <div className="flex justify-center">
                    {order.status === "pending_finance" ? (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          void props.onDeleteOrder(order.id);
                        }}
                        className="inline-flex min-w-[82px] cursor-pointer items-center justify-center rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-sm font-medium text-[#dc2626] transition duration-150 hover:border-[#fda4af] hover:bg-[#ffe4e6] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fecdd3] focus-visible:ring-offset-2"
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="text-sm text-[#94a3b8]">-</span>
                    )}
                  </div>
                  <span className="text-right text-[14px] font-medium text-[#475569]">
                    {formatCurrency(order.totalAmount, order.currencyCode)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-[14px] border border-[#dbeafb] bg-[rgba(255,255,255,0.72)] px-6 py-28 text-center text-[14px] text-[#94a3b8]">
                No orders found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
