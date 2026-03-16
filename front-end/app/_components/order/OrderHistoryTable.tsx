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
  const label =
    status === "pending_higher_up" || status === "pending_finance"
      ? "Pending"
      : status === "rejected_higher_up" || status === "rejected_finance"
        ? "Rejected"
        : status === "approved_finance"
          ? "Approved"
          : "Completed";
  const tone =
    label === "Pending"
      ? "border-[#facc15] bg-[#fff8db] text-[#ca8a04]"
      : label === "Rejected"
        ? "border-[#fca5a5] bg-[#fef2f2] text-[#dc2626]"
        : "border-[#86efac] bg-[#ecfdf3] text-[#16a34a]";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

export function OrderHistoryTable(props: {
  orders: StoredOrder[];
  onOpenDetail: (orderId: string) => void;
}) {
  return (
    <section className="rounded-[18px] border border-[#d9e0e8] bg-white p-3">
      <div className="grid grid-cols-[0.9fr_1.5fr_1.2fr_1fr_1fr_1fr] rounded-[12px] bg-[#eff6ff] px-5 py-4 text-[14px] font-medium text-[#475569]">
        <span className="inline-flex items-center gap-1">
          <span>Order ID</span>
          <SortIcon />
        </span>
        <span>Order Name</span>
        <span>Requester</span>
        <span className="inline-flex items-center gap-1">
          <span>Date</span>
          <SortIcon />
        </span>
        <span>Status</span>
        <span className="inline-flex items-center justify-end gap-1 text-right">
          <span>Total Amount</span>
          <SortIcon />
        </span>
      </div>
      <div className="mt-4 space-y-2">
        {props.orders.length > 0 ? (
          props.orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => props.onOpenDetail(order.id)}
              className="grid w-full grid-cols-[0.9fr_1.5fr_1.2fr_1fr_1fr_1fr] items-center rounded-[12px] border border-[#e5e7eb] bg-white px-5 py-4 text-left transition duration-150 hover:border-[#cbd5e1] hover:shadow-[0_8px_24px_rgba(15,23,42,0.05)] active:scale-[0.995] active:bg-[#f8fafc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
            >
              <span className="text-[14px] font-medium text-[#2563eb]">
                #{order.requestNumber.slice(-6)}
              </span>
              <span className="text-[14px] text-[#334155]">
                {getOrderSummaryName(order)}
              </span>
              <div className="flex items-center gap-2 text-sm text-[#334155]">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-medium text-[#2563eb]">
                  {(order.requester || "R").slice(0, 2).toUpperCase()}
                </span>
                <span>{order.requester || "Unknown requester"}</span>
              </div>
              <span className="text-[14px] text-[#475569]">
                {formatDisplayDate(order.requestDate)}
              </span>
              <StatusBadge status={order.status} />
              <span className="text-right text-[14px] font-medium text-[#334155]">
                {formatCurrency(order.totalAmount, order.currencyCode)}
              </span>
            </button>
          ))
        ) : (
          <div className="rounded-[14px] border border-dashed border-[#d9e0e8] px-6 py-12 text-center text-[14px] text-[#94a3b8]">
            No orders found.
          </div>
        )}
      </div>
    </section>
  );
}
