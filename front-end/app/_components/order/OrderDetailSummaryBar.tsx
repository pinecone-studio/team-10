"use client";

import { formatCurrency, type StoredOrder } from "../../_lib/order-store";
import { getOrderPresentation } from "./orderPresentation";

function SummaryCard(props: {
  label: string;
  value: string;
  accent?: string;
  icon: string;
}) {
  return (
    <div className="rounded-[18px] border border-[#e8eef5] bg-white px-5 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] text-[#94a3b8]">{props.label}</p>
          <p className="mt-3 text-[27px] font-semibold leading-none text-[#111827]">{props.value}</p>
        </div>
        <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] text-lg text-white ${props.accent ?? "bg-[linear-gradient(180deg,#cfe0fb_0%,#a9c4ee_100%)]"}`}>
          {props.icon}
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSummaryBar({ order }: { order: StoredOrder }) {
  const presentation = getOrderPresentation(order.status);

  return (
    <div className="border-b border-[#d9e0e8] bg-white px-9 py-7">
      <div className="grid gap-5 xl:grid-cols-4">
        <SummaryCard label="Order ID" value={`#${order.requestNumber.slice(-6)}`} icon="◫" />
        <SummaryCard label="Status" value={presentation.status.replace("Waiting for ", "")} icon="◌" />
        <SummaryCard label="Total Cost" value={formatCurrency(order.totalAmount, order.currencyCode)} accent="bg-[linear-gradient(180deg,#d6e5ff_0%,#b7cff4_100%)]" icon="$" />
        <SummaryCard label="Assigned Manager" value={order.requestedApproverName ?? order.requester} accent="bg-[linear-gradient(180deg,#d7e3f7_0%,#bccfe9_100%)]" icon="◔" />
      </div>
    </div>
  );
}
