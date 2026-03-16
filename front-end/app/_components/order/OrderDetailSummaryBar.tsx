"use client";

import { formatCurrency, type StoredOrder } from "../../_lib/order-store";
import { getOrderPresentation } from "./orderPresentation";

function SummaryCard(props: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className={`inline-flex h-12 w-12 items-center justify-center rounded-[10px] ${props.accent ?? "bg-[#eff6ff]"}`}>#</div>
      <div><p className="text-sm text-[#94a3b8]">{props.label}</p><p className="mt-1 text-[26px] font-medium leading-none text-[#111827]">{props.value}</p></div>
    </div>
  );
}

export function OrderDetailSummaryBar({ order }: { order: StoredOrder }) {
  const presentation = getOrderPresentation(order.status);

  return (
    <div className="border-b border-[#d9e0e8] bg-white px-9 py-7">
      <div className="grid gap-6 lg:grid-cols-4">
        <SummaryCard label="Order ID" value={`#${order.requestNumber.slice(-6)}`} />
        <SummaryCard label="Status" value={presentation.status.replace("Waiting for ", "")} />
        <SummaryCard label="Total Cost" value={formatCurrency(order.totalAmount, order.currencyCode)} accent="bg-[#ecfdf3]" />
        <SummaryCard label="Assigned Manager" value={order.requestedApproverName ?? order.requester} />
      </div>
    </div>
  );
}
