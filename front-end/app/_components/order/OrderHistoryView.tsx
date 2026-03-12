"use client";

import {
  formatCurrency,
  formatDisplayDate,
  type StoredOrder,
} from "../../_lib/order-store";
import { TopBar } from "./OrderPrimitives";
import { getOrderPresentation } from "./orderHelpers";

function VerticalDots() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-[18px] w-[18px] text-[#6f6f6f]"
      aria-hidden="true"
    >
      <circle cx="8" cy="3.3" r="1.2" fill="currentColor" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="8" cy="12.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function OrderHistoryView(props: {
  orders: StoredOrder[];
  selectedFilter: "all" | "summary" | "completed" | "cancelled";
  onFilterChange: (
    value: "all" | "summary" | "completed" | "cancelled",
  ) => void;
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
      <TopBar
        actionLabel="Create a new order"
        onAction={props.onOpenCreate}
        showNotification
      />
      <h2 className="pt-[6px] text-[24px] font-semibold leading-[1.2] text-[#111111]">
        Order history
      </h2>

      <div className="flex items-center justify-between pt-[6px]">
        <div className="flex items-center gap-[40px]">
          {filters.map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => props.onFilterChange(key)}
              className={`text-[18px] leading-none ${
                props.selectedFilter === key
                  ? "font-semibold text-[#111111] underline underline-offset-[6px]"
                  : "text-[#767676]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-[14px]">
          <input
            type="date"
            className="h-[40px] w-[137px] rounded-[6px] border border-[#d8d8dc] bg-[#efefef] px-[12px] text-[14px] text-[#7a7a7a]"
            aria-label="From date"
          />
          <span className="text-[17px] text-[#383838]">To</span>
          <input
            type="date"
            className="h-[40px] w-[137px] rounded-[6px] border border-[#d8d8dc] bg-[#efefef] px-[12px] text-[14px] text-[#7a7a7a]"
            aria-label="To date"
          />
        </div>
      </div>

      <section className="pt-[8px]">
        <div className="grid grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr_1fr_0.7fr] gap-[12px] rounded-[6px] border border-[#d7d7da] bg-[#dbdcdf] px-[16px] py-[18px] text-[15px] text-[#707070]">
          <span>Id</span>
          <span>Name</span>
          <span>Created date</span>
          <span>Type</span>
          <span>Status</span>
          <span>Total</span>
          <span>Action</span>
        </div>

        <div className="mt-[14px] space-y-[8px]">
          {props.orders.length > 0 ? (
            props.orders.map((order) => {
              const presentation = getOrderPresentation(order.status);
              return (
                <div
                  key={order.id}
                  className="grid grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr_1fr_0.7fr] items-center gap-[12px] rounded-[6px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[17px] text-[15px] text-[#565656]"
                >
                  <span>#{order.requestNumber.slice(-4)}</span>
                  <span>Order name</span>
                  <span>{formatDisplayDate(order.requestDate)}</span>
                  <span
                    className={
                      presentation.status.includes("Waiting")
                        ? "text-[#ff7a00]"
                        : presentation.status.includes("Rejected")
                          ? "text-[#e05639]"
                          : presentation.status.includes("Assigned")
                            ? "text-[#1888d7]"
                            : "text-[#058638]"
                    }
                  >
                    {presentation.type.replace("review", "permission")}
                  </span>
                  <span
                    className={`inline-flex w-fit rounded-[99px] border px-[8px] py-[1px] text-[13px] ${presentation.tone}`}
                  >
                    {presentation.status.includes("Waiting")
                      ? "Waiting"
                      : presentation.status.includes("Rejected")
                        ? "Rejected"
                        : presentation.status.includes("Assigned")
                          ? "Assigned"
                          : "Allowed"}
                  </span>
                  <span>{formatCurrency(order.totalAmount)}</span>
                  <button
                    type="button"
                    onClick={() => props.onOpenDetail(order.id)}
                    className="inline-flex items-center"
                  >
                    <VerticalDots />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="rounded-[6px] border border-dashed border-[#cfcfd3] px-[16px] py-[28px] text-center text-[15px] text-[#7f7f7f]">
              No orders found for this filter.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
