"use client";

import { formatCurrency, formatDisplayDate, type StoredOrder } from "../../_lib/order-store";
import { TopBar } from "./OrderPrimitives";
import { buildFeedEvents, getOrderPresentation } from "./orderHelpers";

function VerticalDots() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[18px] w-[18px] text-[#4a6a95]" aria-hidden="true">
      <circle cx="8" cy="3.3" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="12.7" r="1.2" fill="currentColor" />
    </svg>
  );
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
      <h2 className="pt-[6px] text-[32px] font-semibold leading-[1.2] text-[#111111]">Order detail</h2>

      <section className="pt-[8px]">
        <div className="grid grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr_1fr_0.7fr] gap-[12px] rounded-[6px] border border-[#d7d7da] bg-[#dbdcdf] px-[16px] py-[18px] text-[15px] text-[#707070]">
          <span>Id</span><span>Name</span><span>Created date</span><span>Type</span><span>Status</span><span>Total</span><span>Action</span>
        </div>
        <div className="mt-[14px] grid grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr_1fr_0.7fr] items-center gap-[12px] rounded-[6px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[17px] text-[15px] text-[#565656]">
          <span>#{props.order.requestNumber.slice(-4)}</span>
          <span>Order name</span>
          <span>{formatDisplayDate(props.order.requestDate)}</span>
          <span className={presentation.status.includes("Waiting") ? "text-[#ff7a00]" : presentation.status.includes("Rejected") ? "text-[#e05639]" : presentation.status.includes("Assigned") ? "text-[#1888d7]" : "text-[#058638]"}>{presentation.type.replace("review", "permission")}</span>
          <span className={`inline-flex w-fit rounded-[99px] border px-[8px] py-[1px] text-[13px] ${presentation.tone}`}>
            {presentation.status.includes("Waiting") ? "Waiting" : presentation.status.includes("Rejected") ? "Rejected" : presentation.status.includes("Assigned") ? "Assigned" : "Allowed"}
          </span>
          <span>{formatCurrency(props.order.totalAmount)}</span>
          <span><VerticalDots /></span>
        </div>
      </section>

      <h3 className="pt-[18px] text-[30px] font-semibold leading-[1.2] text-[#111111]">Feed</h3>

      <section className="rounded-[10px] px-[12px] pb-[8px]">
        <div className="space-y-[12px]">
          {feedEvents.map((event, index) => (
            <div key={`${event.date}-${index}`} className="grid grid-cols-[16px_auto_1fr] items-start gap-[10px] text-[15px] text-[#666666]">
              <span className={`mt-[6px] inline-flex h-[12px] w-[12px] rounded-full border ${event.featured ? "border-[#888] bg-[#efefef]" : "border-[#b8b8b8]"}`} />
              <span>{event.date}</span>
              <p><span className="font-semibold text-[#222222]">{event.actor}</span> {event.message}</p>
            </div>
          ))}
        </div>

        <div className="mt-[16px] ml-[32px] rounded-[18px] border border-[#d1d2d7] bg-[#efefef] px-[20px] py-[18px] text-[15px] text-[#757575]">
          Write a detailed description
        </div>

        <div className="mt-[20px] ml-[20px] rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[14px] py-[12px]">
          <div className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-[12px] border-b border-[#d4d4d8] pb-[10px] text-[14px] text-[#7a7a7a]">
            <span>Product name</span><span>Code</span><span>Quantity</span><span>Unit</span><span>Unit price</span><span>Total price</span>
          </div>
          <div className="space-y-[6px] pt-[8px]">
            {props.order.items.map((item, index) => (
              <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-[12px] py-[6px] text-[15px] text-[#444444]">
                <span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{item.unit}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>
          <div className="mt-[8px] flex items-center justify-between rounded-[6px] bg-[#dbdcdf] px-[12px] py-[10px] text-[15px] font-semibold text-[#161616]">
            <span>Total:</span>
            <span>{formatCurrency(props.order.totalAmount)}</span>
          </div>
        </div>
      </section>

      <div className="pt-[4px]">
        <button type="button" onClick={props.onBack} className="inline-flex h-[41px] items-center justify-center rounded-[6px] border border-[#d2d2d5] bg-[#ececef] px-[24px] text-[15px] text-[#161616]">Back</button>
      </div>
    </>
  );
}
