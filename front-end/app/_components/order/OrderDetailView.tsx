"use client";

import { formatCurrency, formatDisplayDate, type OrderStatus, type StoredOrder } from "../../_lib/order-store";
import { ActionButton } from "../shared/WorkspacePrimitives";
import { TopBar } from "./OrderPrimitives";
import { buildFeedEvents, getOrderPresentation, getProgressLabels } from "./orderHelpers";

function Stepper({ status }: { status: OrderStatus }) {
  const labels = getProgressLabels(status);
  const activeIndex =
    status === "assigned_hr"
      ? 4
      : status === "received_inventory" || status === "approved_finance"
        ? 3
        : status === "pending_finance" || status === "rejected_finance"
          ? 2
          : 1;

  return <div className="rounded-[16px] border border-[#dbdbdb] bg-white px-[18px] py-[18px]"><div className="flex flex-wrap items-start justify-center gap-[14px]">{labels.map((label, index) => <div key={label} className="flex items-center gap-[14px]"><div className="flex flex-col items-center gap-[9px]"><div className={`flex h-[28px] w-[28px] items-center justify-center rounded-full border text-[12px] ${index <= activeIndex ? "border-black bg-black text-white" : "border-[#8f8f8f] bg-white text-[#8f8f8f]"}`}>{index < activeIndex ? "OK" : index + 1}</div><span className={`max-w-[84px] text-center text-[10px] ${index === activeIndex ? "text-[#171717]" : "text-[#8f8f8f]"}`}>{label}</span></div>{index < labels.length - 1 ? <div className="h-px w-[28px] bg-[#dddddd]" /> : null}</div>)}</div></div>;
}

export function OrderDetailView(props: {
  order: StoredOrder;
  onBack: () => void;
  onCreateNote: () => void;
}) {
  const presentation = getOrderPresentation(props.order.status);
  const feedEvents = buildFeedEvents(props.order);

  return (
    <>
      <TopBar actionLabel="Create additional note" onAction={props.onCreateNote} />
      <div><h2 className="text-[16px] font-semibold text-[#171717]">Order detail</h2></div>
      <section className="rounded-[16px] border border-[#dbdbdb] bg-white px-[12px] py-[12px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="grid grid-cols-[0.8fr_1.2fr_1fr_1.1fr_1fr_1fr_0.6fr] gap-[12px] rounded-[8px] bg-[#f1f1f2] px-[14px] py-[12px] text-[11px] text-[#8a8a8a]"><span>Id</span><span>Name</span><span>Created</span><span>Type</span><span>Status</span><span>Total</span><span>Action</span></div>
        <div className="mt-[12px] grid grid-cols-[0.8fr_1.2fr_1fr_1.1fr_1fr_1fr_0.6fr] items-center gap-[12px] rounded-[10px] border border-[#ececec] px-[14px] py-[16px] text-[12px]"><span>#{props.order.requestNumber.slice(-3)}</span><span>{props.order.items[0]?.name ?? "Order name"}</span><span>{formatDisplayDate(props.order.requestDate)}</span><span>{presentation.type}</span><span className={`inline-flex w-fit rounded-full border px-[8px] py-[2px] text-[10px] ${presentation.tone}`}>{presentation.status}</span><span>{formatCurrency(props.order.totalAmount)}</span><span>...</span></div>
      </section>
      <div><h2 className="text-[16px] font-semibold text-[#171717]">Order progress</h2></div>
      <Stepper status={props.order.status} />
      <section className="rounded-[16px] border border-[#dbdbdb] bg-white px-[16px] py-[16px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between border-b border-[#ececec] pb-[12px]"><h3 className="text-[13px] font-semibold text-[#171717]">Activity feed</h3><span className="text-[11px] text-[#8a8a8a]">{feedEvents.length} update</span></div>
        <div className="mt-[16px] space-y-[14px]">{feedEvents.map((event, index) => <div key={`${event.date}-${index}`} className={`flex gap-[12px] rounded-[12px] border px-[12px] py-[12px] text-[12px] ${event.featured ? "border-[#d9e7d9] bg-[#f7fbf7]" : "border-[#ececec] bg-white"}`}><div className={`mt-[4px] h-[8px] w-[8px] rounded-full ${event.featured ? "bg-[#149b63]" : "border border-[#bfbfbf]"}`} /><div className="flex-1"><p className="leading-[1.5]"><span className="text-[#8a8a8a]">{event.date}</span><span className="mx-[6px] font-semibold text-[#171717]">{event.actor}</span><span>{event.message}</span></p></div></div>)}</div>
        <div className="mt-[20px]"><div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr] gap-[12px] px-[10px] text-[10px] text-[#8a8a8a]"><span>Product name</span><span>Code</span><span>Quantity</span><span>Unit</span><span>Unit price</span><span>Total price</span></div><div className="mt-[10px] space-y-[8px]">{props.order.items.map((item, index) => <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr] items-center gap-[12px] px-[10px] py-[10px] text-[12px]"><span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{item.unit}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span></div>)}</div></div>
      </section>
      <div className="flex justify-start"><ActionButton variant="light" onClick={props.onBack}>Back</ActionButton></div>
    </>
  );
}
