"use client";

import type { StoredOrder } from "../../../_lib/order-types";
import { formatMoney } from "./utils";
import { getItemDecision, getOrderStats, type DecisionState, type ItemDecision } from "./utils";

export function FinanceApprovalOrderCard(props: {
  order: StoredOrder;
  decisionState: DecisionState;
  onSetDecision: (orderId: string, catalogId: string, code: string, decision: ItemDecision) => void;
  onApproveAll: (order: StoredOrder, decision: "approved" | "rejected") => void;
  onSubmit: (order: StoredOrder) => void | Promise<void>;
}) {
  const stats = getOrderStats(props.order, props.decisionState);
  return (
    <section className="overflow-hidden rounded-[18px] border border-[#dbe8f6] bg-white">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#e6eef7] bg-[linear-gradient(180deg,#f9fbff_0%,#eef6ff_100%)] px-5 py-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b85a7]">Approval Queue</p>
          <h2 className="mt-2 text-[24px] font-semibold text-[#0f172a]">{props.order.requestNumber}</h2>
          <p className="mt-1 text-[14px] text-[#64748b]">{props.order.requester} · {props.order.department}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill>{props.order.items.length} item(s)</Pill>
          <Pill>{formatMoney(props.order.totalAmount, props.order.currencyCode)}</Pill>
        </div>
      </div>
      <div className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Pill>{stats.pending} pending</Pill>
            <Pill tone="green">{stats.approved} approve</Pill>
            <Pill tone="orange">{stats.rejected} reject</Pill>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => props.onApproveAll(props.order, "approved")}>Approve all</Button>
            <Button tone="warning" onClick={() => props.onApproveAll(props.order, "rejected")}>Reject all</Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-[16px] border border-[#dbe8f6]">
          <table className="w-full table-fixed text-[12px] text-[#334155]">
            <thead className="bg-[#eaf2ff] text-[#47627f]"><tr><Th>No</Th><Th>Item</Th><Th>Code</Th><Th>Qty</Th><Th right>Unit price</Th><Th right>Total</Th><Th center>Decision</Th></tr></thead>
            <tbody>{props.order.items.map((item, index) => {
              const decision = getItemDecision(props.decisionState, props.order.id, item.catalogId, item.code);
              return <tr key={`${props.order.id}-${item.code}-${index}`} className="border-t border-[#edf2f7]">
                <Td>{index + 1}</Td><Td strong>{item.name}<div className="mt-1 text-[11px] text-[#8fa0ba]">{item.unit}</div></Td><Td>{item.code}</Td><Td>{item.quantity}</Td>
                <Td right>{formatMoney(item.unitPrice, item.currencyCode)}</Td><Td right strong>{formatMoney(item.totalPrice, item.currencyCode)}</Td>
                <Td center><div className="mx-auto grid max-w-[168px] grid-cols-2 rounded-[12px] border border-[#dbe3ee] bg-[#fbfdff] p-1">
                  <DecisionButton active={decision === "approved"} tone="green" onClick={() => props.onSetDecision(props.order.id, item.catalogId, item.code, "approved")}>Approve</DecisionButton>
                  <DecisionButton active={decision === "rejected"} tone="orange" onClick={() => props.onSetDecision(props.order.id, item.catalogId, item.code, "rejected")}>Reject</DecisionButton>
                </div></Td></tr>;
            })}</tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[14px] text-[#64748b]">{stats.pending > 0 ? "Choose approve or reject for each item before submitting." : "All items are decided. Submit to continue."}</p>
          <Button disabled={stats.pending > 0} onClick={() => props.onSubmit(props.order)}>Submit decisions</Button>
        </div>
      </div>
    </section>
  );
}

function Button(props: { children: React.ReactNode; onClick?: () => void | Promise<void>; disabled?: boolean; tone?: "default" | "warning" }) {
  return <button type="button" onClick={props.onClick} disabled={props.disabled} className={`h-10 rounded-[10px] px-4 text-[13px] font-medium disabled:opacity-40 ${props.tone === "warning" ? "bg-[#fff1f2] text-[#dc2626]" : "bg-[#0f172a] text-white"}`}>{props.children}</button>;
}
function DecisionButton(props: { children: React.ReactNode; active: boolean; tone: "green" | "orange"; onClick: () => void }) {
  const activeClass = props.tone === "green" ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#ffedd5] text-[#c2410c]";
  return <button type="button" onClick={props.onClick} className={`rounded-[10px] px-2 py-2 text-[14px] font-medium ${props.active ? activeClass : "text-[#64748b]"}`}>{props.children}</button>;
}
function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "orange" }) {
  const className = tone === "green" ? "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]" : tone === "orange" ? "border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]" : "border-[#dbe4ee] bg-[#f8fbff] text-[#475569]";
  return <span className={`rounded-full border px-3 py-1 text-[12px] font-medium ${className}`}>{children}</span>;
}
function Th(props: { children: React.ReactNode; right?: boolean; center?: boolean }) { return <th className={`px-3 py-3 font-medium ${props.right ? "text-right" : props.center ? "text-center" : "text-left"}`}>{props.children}</th>; }
function Td(props: { children: React.ReactNode; right?: boolean; center?: boolean; strong?: boolean }) { return <td className={`px-3 py-3 align-top ${props.right ? "text-right" : props.center ? "text-center" : "text-left"} ${props.strong ? "font-semibold text-[#0f172a]" : ""}`}>{props.children}</td>; }
