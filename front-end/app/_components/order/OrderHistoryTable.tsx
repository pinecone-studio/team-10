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
          : status === "assigned_hr"
            ? "Cancelled"
          : "Completed";
  const tone =
    label === "Pending"
      ? "border-[#fde047] bg-[#fef9c3] text-[#ca8a04]"
      : label === "Rejected"
        ? "border-[#fca5a5] bg-[#fee2e2] text-[#dc2626]"
        : label === "Cancelled"
          ? "border-[#d1d5db] bg-[#f3f4f6] text-[#4b5563]"
          : label === "Approved"
            ? "border-[#93c5fd] bg-[#dbeafe] text-[#2563eb]"
            : "border-[#86efac] bg-[#dcfce7] text-[#16a34a]";

  return (
    <span
      className={`inline-flex rounded-full border px-[10px] py-[2px] text-[12px] font-normal leading-normal ${tone}`}
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
    <section className="rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-6">
      <div className="overflow-x-auto">
        <div className="min-w-[920px]">
          <div className="grid grid-cols-[100px_1.45fr_1.35fr_120px_130px_130px] items-center rounded-[6px] border border-[#e3e4e8] bg-[#f1f5f9] px-6 py-6 text-[14px] font-medium text-[#475569]">
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
          <div className="mt-5 space-y-[6px]">
            {props.orders.length > 0 ? (
              props.orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => props.onOpenDetail(order.id)}
                  className="grid w-full grid-cols-[100px_1.45fr_1.35fr_120px_130px_130px] items-center rounded-[6px] border border-[#e3e4e8] bg-white px-6 py-4 text-left transition duration-150 hover:border-[#cbd5e1] hover:bg-[#fcfcfd] active:scale-[0.995] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
                >
                  <span className="text-[14px] font-medium text-[#2563eb]">
                    #{order.requestNumber.slice(-6)}
                  </span>
                  <span className="text-[14px] font-medium text-[#475569]">
                    <span className="block">{getOrderSummaryName(order)}</span>
                    {order.items.length > 0 ? (
                      <span className="mt-1 block truncate text-[12px] font-normal text-[#94a3b8]">
                        {order.items[0]?.code} · {order.items[0]?.quantity} {order.items[0]?.unit}
                        {order.items.length > 1 ? ` · +${order.items.length - 1} more item` : ""}
                      </span>
                    ) : null}
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
                  <span className="text-right text-[14px] font-medium text-[#475569]">
                    {formatCurrency(order.totalAmount, order.currencyCode)}
                  </span>
                </button>
              ))
            ) : (
              <div className="rounded-[6px] border border-[#e3e4e8] px-6 py-16 text-center text-[14px] text-[#94a3b8]">
                No orders found.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
