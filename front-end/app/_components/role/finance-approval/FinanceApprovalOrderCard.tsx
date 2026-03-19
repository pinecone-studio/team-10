"use client";

import { formatDisplayDate } from "../../../_lib/order-store";
import type { StoredOrder } from "../../../_lib/order-types";
import { formatMoney, formatOrderMeta } from "./utils";
import { getItemDecision, getOrderStats, type DecisionState, type ItemDecision } from "./utils";

export function FinanceApprovalOrderCard(props: {
  order: StoredOrder;
  decisionState: DecisionState;
  onSetDecision: (orderId: string, catalogId: string, code: string, decision: ItemDecision) => void;
  onSubmit: (order: StoredOrder) => void | Promise<void>;
}) {
  const stats = getOrderStats(props.order, props.decisionState);
  const infoCards = [
    ["HIGHER-UP REVIEWER", props.order.requestedApproverName ?? "Direct to Finance"],
    ["APPROVED AT", props.order.higherUpReviewedAt ? formatDisplayDate(props.order.higherUpReviewedAt.slice(0, 10)) : "-"],
    ["REQUESTED ON", formatDisplayDate(props.order.requestDate)],
    ["ORDER TOTAL", formatMoney(props.order.totalAmount, props.order.currencyCode)],
  ] as const;
  return (
    <section className="flex self-stretch rounded-[16px] border border-[rgba(255,255,255,0.20)] bg-[rgba(255,255,255,0.70)] px-4 py-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex w-full flex-col items-start gap-[20px]">
        <div className="flex w-full flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-[var(--font-inter)] text-[14px] font-normal uppercase leading-[20px] text-[#64748B]">APPROVAL QUEUE</p>
            <h2 className="mt-2 font-[var(--font-inter)] text-[16px] font-medium leading-[28px] text-[#050810]">{props.order.requestNumber}</h2>
            <p className="mt-1 font-[var(--font-inter)] text-[14px] font-normal leading-[20px] text-[#64748B]">{formatOrderMeta(props.order)}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="mb-[30px] flex flex-nowrap gap-5">
            {infoCards.map(([label, value]) => (
              <div
                key={label}
                className="flex h-[74px] min-w-0 flex-1 flex-col justify-center rounded-[16px] border border-[#D8E8FF] bg-[rgba(255,255,255,0)] px-[28px] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]"
              >
                <p className="font-[var(--font-inter)] text-[14px] font-normal uppercase leading-[20px] text-[#64748B]">{label}</p>
                <p className="mt-1 font-[var(--font-inter)] text-[16px] font-medium leading-[28px] text-[#050810]">{value}</p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-[16px] border border-[#E2ECFA] bg-white shadow-[0_4px_12px_rgba(148,163,184,0.08)]">
            <table className="w-full table-fixed text-[12px] text-[#334155]">
              <thead className="bg-[#EAF3FF] text-[#5C7394]"><tr><Th>No</Th><Th>Item</Th><Th>Code</Th><Th>Qty</Th><Th>Unit price</Th><Th right>Total</Th><Th center>Decision</Th></tr></thead>
              <tbody>{props.order.items.map((item, index) => {
                const decision = getItemDecision(props.decisionState, props.order.id, item.catalogId, item.code);
                return <tr key={`${props.order.id}-${item.code}-${index}`} className="border-t border-[#edf2f7]">
                  <Td>{index + 1}</Td><Td strong>{item.name}<div className="mt-1 text-[11px] text-[#8fa0ba]">{item.unit}</div></Td><Td>{item.code}</Td><Td>{item.quantity}</Td>
                  <Td>{formatMoney(item.unitPrice, item.currencyCode)}</Td><Td right strong>{formatMoney(item.totalPrice, item.currencyCode)}</Td>
                  <Td center><div className="mx-auto grid max-w-[234px] grid-cols-2 rounded-[10px] border border-[#CFE0F8] bg-white p-1 shadow-[0_6px_14px_rgba(148,163,184,0.12)]">
                    <DecisionButton active={decision === "rejected"} tone="orange" onClick={() => props.onSetDecision(props.order.id, item.catalogId, item.code, "rejected")}>Reject</DecisionButton>
                    <DecisionButton active={decision === "approved"} tone="green" onClick={() => props.onSetDecision(props.order.id, item.catalogId, item.code, "approved")}>Approve</DecisionButton>
                  </div></Td></tr>;
              })}</tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[14px] text-[#64748b]">{stats.pending > 0 ? "Choose approve or reject for each item before submitting." : "All items are decided. Submit to split approved and rejected items automatically."}</p>
            <Button tone="success" disabled={stats.pending > 0} onClick={() => props.onSubmit(props.order)}>Submit decisions</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Button(props: { children: React.ReactNode; onClick?: () => void | Promise<void>; disabled?: boolean; tone?: "default" | "success" }) {
  return <button type="button" onClick={props.onClick} disabled={props.disabled} className={`h-[44px] rounded-[6px] px-6 text-[14px] font-medium text-white disabled:opacity-40 ${props.tone === "success" ? "bg-[#4ADE80] shadow-[0_8px_20px_rgba(74,222,128,0.35)]" : "bg-[#0f172a]"}`}>{props.children}</button>;
}
function DecisionButton(props: { children: React.ReactNode; active: boolean; tone: "green" | "orange"; onClick: () => void }) {
  const activeClass = "bg-[#DCEBFF] text-[#64748B] shadow-[0_4px_8px_rgba(148,163,184,0.16)]";
  return <button type="button" onClick={props.onClick} className={`rounded-[8px] px-2 py-[6px] text-[14px] font-normal ${props.active ? activeClass : "text-[#64748b]"}`}>{props.children}</button>;
}
function Th(props: { children: React.ReactNode; right?: boolean; center?: boolean }) { return <th className={`px-3 py-3 text-[14px] font-normal ${props.right ? "text-right" : props.center ? "text-center" : "text-left"}`}>{props.children}</th>; }
function Td(props: { children: React.ReactNode; right?: boolean; center?: boolean; strong?: boolean }) { return <td className={`px-3 py-3 align-middle text-[14px] ${props.right ? "text-right" : props.center ? "text-center" : "text-left"} ${props.strong ? "font-medium text-[#111827]" : ""}`}>{props.children}</td>; }
