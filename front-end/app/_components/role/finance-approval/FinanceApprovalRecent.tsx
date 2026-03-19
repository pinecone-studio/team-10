"use client";

import { formatDisplayDate } from "../../../_lib/order-store";
import type { StoredOrder } from "../../../_lib/order-types";
import { formatMoney, getProcessedStatusLabel, getProcessedTone } from "./utils";

export function FinanceApprovalRecent(props: { orders: StoredOrder[]; pendingCount: number }) {
  return (
    <section className="px-5 py-5">
      <div className="flex items-center justify-between gap-4 border-b border-[#e6eef7] pb-4">
        <div>
          <p className="font-[var(--font-inter)] text-[14px] font-normal uppercase leading-[20px] text-[#64748B]">RECENT DECISIONS</p>
          <h2 className="mt-2 font-[var(--font-inter)] text-[16px] font-medium leading-[28px] text-[#050810]">Last reviewed requests</h2>
        </div>
        <span className="text-[14px] text-[#64748b]">{props.orders.length} records</span>
      </div>
      <div className="mt-5 overflow-hidden rounded-[18px] border border-[#dbe8f6]">
        {props.orders.length === 0 ? (
          <EmptyPanel
            title={props.pendingCount === 0 ? "No finance decisions yet." : "No reviewed records yet."}
            description="Reviewed requests will appear here with their latest status."
          />
        ) : (
          <table className="w-full table-fixed text-left text-[13px] text-[#334155]">
            <thead className="bg-[#eef5ff] text-[#5a7393]"><tr><Th>Request</Th><Th>Requester</Th><Th>Reviewed</Th><Th>Items</Th><Th>Amount</Th><Th>Status</Th></tr></thead>
            <tbody>{props.orders.map((order) => <tr key={order.id} className="border-t border-[#edf2f7]">
              <Td><div className="whitespace-nowrap font-[var(--font-inter)] text-[12px] font-normal leading-none text-[#050810]">{order.requestNumber}</div></Td>
              <Td>{order.requester}</Td>
              <Td>{order.financeReviewedAt ? formatDisplayDate(order.financeReviewedAt.slice(0, 10)) : "-"}</Td>
              <Td>{order.items.length}</Td>
              <Td>{formatMoney(order.totalAmount, order.currencyCode)}</Td>
              <Td><span className={`font-geist whitespace-nowrap rounded-full px-3 py-1 text-[12px] font-medium leading-4 ${getProcessedTone(order)}`}>{getProcessedStatusLabel(order)}</span></Td>
            </tr>)}</tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function EmptyPanel(props: { title: string; description: string }) {
  return <div className="px-6 py-14 text-center"><p className="text-[18px] font-semibold text-[#0f172a]">{props.title}</p><p className="mt-3 text-[14px] text-[#64748b]">{props.description}</p></div>;
}
function Th({ children }: { children: React.ReactNode }) { return <th className="whitespace-nowrap px-4 py-3 font-medium">{children}</th>; }
function Td(props: { children: React.ReactNode; strong?: boolean }) { return <td className={`whitespace-nowrap px-4 py-3 align-top ${props.strong ? "font-semibold text-[#0f172a]" : ""}`}>{props.children}</td>; }
