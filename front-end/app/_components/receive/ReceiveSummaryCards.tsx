"use client";

import { formatCurrency } from "../../_lib/order-store";
import type { CurrencyCode } from "../../_lib/order-types";

function ReceiveSummaryIcon({ kind }: { kind: "status" | "received" | "cost" }) {
  if (kind === "status") {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 6V12L14.5 16" stroke="white" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  if (kind === "received") {
    return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5"><path d="M12 3V15" stroke="white" strokeLinecap="round" strokeLinejoin="round" /><path d="M7 10L12 15L17 10" stroke="white" strokeLinecap="round" strokeLinejoin="round" /><path d="M5 21H19" stroke="white" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  return <span className="text-[18px] text-white">$</span>;
}

function ReceiveSummaryCard(props: {
  label: string;
  value: string;
  icon: "status" | "received" | "cost";
  accentValue?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-[#e2efff] bg-white px-5 py-4 shadow-[0_14px_34px_rgba(125,170,232,0.12),0_6px_16px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[14px] text-[#64748b]">{props.label}</p>
          <p className={`mt-3 text-[16px] ${props.accentValue ? "font-medium text-[#4f82db]" : "font-medium text-[#111827]"}`}>{props.value}</p>
        </div>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[linear-gradient(180deg,#bfd2ef_0%,#9eb7da_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]">
          <ReceiveSummaryIcon kind={props.icon} />
        </div>
      </div>
    </div>
  );
}

export function ReceiveSummaryCards(props: {
  hasApprovedRows: boolean;
  totalReceivedQuantity: number;
  totalQuantity: number;
  totalCost: number;
  currencyCode: CurrencyCode;
}) {
  return (
    <div className="pl-[44px] pr-[50px] pt-5">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-4 md:grid-cols-3">
        <ReceiveSummaryCard label="Status" value={props.hasApprovedRows ? "Approved" : "Received"} icon="status" accentValue />
        <ReceiveSummaryCard label="Received" value={`${props.totalReceivedQuantity}/${props.totalQuantity || 0}`} icon="received" />
        <ReceiveSummaryCard label="Total Cost" value={formatCurrency(props.totalCost, props.currencyCode)} icon="cost" />
      </div>
    </div>
  );
}
