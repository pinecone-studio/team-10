"use client";

import { formatCurrency, formatDisplayDate, type StoredOrder } from "../../_lib/order-store";
import { TopBar } from "./OrderPrimitives";
import { getOrderPresentation, getOrderSummaryMeta, getOrderSummaryName } from "./orderHelpers";

export function OrderHistoryView(props: {
  orders: StoredOrder[];
  selectedFilter: "all" | "summary" | "completed" | "cancelled";
  onFilterChange: (value: "all" | "summary" | "completed" | "cancelled") => void;
  onOpenCreate: () => void;
  onOpenDetail: (orderId: string) => void;
}) {
  const filters = [
    ["all", "All Order"],
    ["summary", "Summary"],
    ["completed", "Completed"],
    ["cancelled", "Cancelled"],
  ] as const;

  return (
    <>
      <TopBar actionLabel="Open order form" onAction={props.onOpenCreate} />
      <div><h2 className="text-[16px] font-semibold text-[#171717]">Order history</h2></div>
      <div className="flex items-center gap-[26px]">{filters.map(([key, label]) => <button key={key} type="button" onClick={() => props.onFilterChange(key)} className={`text-[12px] ${props.selectedFilter === key ? "font-semibold text-[#171717] underline underline-offset-[5px]" : "text-[#8b8b8b]"}`}>{label}</button>)}</div>
      <section className="rounded-[16px] border border-[#dbdbdb] bg-white px-[12px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-[0.8fr_1.45fr_1fr_1.1fr_1fr_1fr_0.6fr] gap-[12px] rounded-[8px] bg-[#f1f1f2] px-[14px] py-[12px] text-[11px] text-[#8a8a8a]"><span>Id</span><span>Name</span><span>Created date</span><span>Type</span><span>Status</span><span>Total</span><span>Action</span></div>
        <div className="mt-[12px] space-y-[10px]">
          {props.orders.length > 0 ? props.orders.map((order) => {
            const presentation = getOrderPresentation(order.status);
            return (
              <div key={order.id} className="grid grid-cols-[0.8fr_1.45fr_1fr_1.1fr_1fr_1fr_0.6fr] items-center gap-[12px] rounded-[12px] border border-[#ececec] px-[14px] py-[14px] text-[12px] transition-colors hover:bg-[#fcfcfc]">
                <span className="font-medium text-[#171717]">#{order.requestNumber.slice(-3)}</span>
                <div><p className="font-medium text-[#171717]">{getOrderSummaryName(order)}</p><p className="mt-[3px] text-[10px] text-[#8b8b8b]">{getOrderSummaryMeta(order)}</p></div>
                <span>{formatDisplayDate(order.requestDate)}</span>
                <span>{presentation.type}</span>
                <span className={`inline-flex w-fit rounded-full border px-[8px] py-[2px] text-[10px] ${presentation.tone}`}>{presentation.status}</span>
                <span>{formatCurrency(order.totalAmount)}</span>
                <button type="button" onClick={() => props.onOpenDetail(order.id)} className="text-left text-[18px] leading-none text-[#7f8aa3]">...</button>
              </div>
            );
          }) : <div className="rounded-[12px] border border-dashed border-[#dddddd] px-[16px] py-[24px] text-center text-[12px] text-[#8b8b8b]">No orders found for this filter.</div>}
        </div>
      </section>
    </>
  );
}
