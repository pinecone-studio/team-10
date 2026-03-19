"use client";

import { formatCurrency, type StoredOrder } from "../../_lib/order-store";
import { getOrderPresentation } from "./orderPresentation";

function SummaryIcon({ kind }: { kind: "order" | "status" | "cost" | "manager" }) {
  if (kind === "order") {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M5.00016 18.3333C4.55814 18.3333 4.13421 18.1577 3.82165 17.8451C3.50909 17.5326 3.3335 17.1087 3.3335 16.6666V3.3333C3.3335 2.89127 3.50909 2.46734 3.82165 2.15478C4.13421 1.84222 4.55814 1.66663 5.00016 1.66663H11.6668C11.9306 1.6662 12.1919 1.71796 12.4356 1.81894C12.6793 1.91991 12.9006 2.06809 13.0868 2.25496L16.0768 5.24496C16.2642 5.43122 16.4128 5.65275 16.5141 5.89676C16.6153 6.14078 16.6673 6.40244 16.6668 6.66663V16.6666C16.6668 17.1087 16.4912 17.5326 16.1787 17.8451C15.8661 18.1577 15.4422 18.3333 15.0002 18.3333H5.00016Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11.6665 1.66663V5.83329C11.6665 6.05431 11.7543 6.26627 11.9106 6.42255C12.0669 6.57883 12.2788 6.66663 12.4998 6.66663H16.6665" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M8.33317 7.5H6.6665" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.3332 10.8334H6.6665" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.3332 14.1666H6.6665" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "status") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 6V12L14.5 16" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "cost") {
    return <span className="text-[18px] text-white">$</span>;
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path d="M19 21V19C19 17.9391 18.5786 16.9217 17.8284 16.1716C17.0783 15.4214 16.0609 15 15 15H9C7.93913 15 6.92172 15.4214 6.17157 16.1716C5.42143 16.9217 5 17.9391 5 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SummaryCard(props: { label: string; value: string; icon: "order" | "status" | "cost" | "manager"; accentValue?: boolean }) {
  return (
    <div className="rounded-[18px] border border-[#e2efff] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(125,170,232,0.12),0_6px_16px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] text-[#64748b]">{props.label}</p>
          <p className={`mt-3 text-[16px] ${props.accentValue ? "font-medium text-[#4f82db]" : "font-medium text-[#111827]"}`}>{props.value}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#bfd2ef_0%,#9eb7da_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]">
          <SummaryIcon kind={props.icon} />
        </div>
      </div>
    </div>
  );
}

export function OrderDetailSummaryBar({ order }: { order: StoredOrder }) {
  const presentation = getOrderPresentation(order.status);

  return (
    <div className="px-[40px] pt-5">
      <div className="grid gap-4 xl:grid-cols-4">
        <SummaryCard label="Order ID" value={`#${order.requestNumber.slice(-6)}`} icon="order" accentValue />
        <SummaryCard label="Status" value={presentation.status.replace("Waiting for ", "")} icon="status" accentValue />
        <SummaryCard label="Total Cost" value={formatCurrency(order.totalAmount, order.currencyCode)} icon="cost" />
        <SummaryCard label="Assigned Manager" value={order.requestedApproverName ?? order.requester} icon="manager" />
      </div>
    </div>
  );
}
