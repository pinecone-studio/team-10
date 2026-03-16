"use client";

import type { StoredOrder } from "../../_lib/order-store";
import { OrderDetailActivityPanel } from "./OrderDetailActivityPanel";
import { OrderDetailItemsPanel } from "./OrderDetailItemsPanel";
import { OrderDetailSummaryBar } from "./OrderDetailSummaryBar";
import { OrderPageHeader } from "./OrderPageHeader";

export function OrderDetailView(props: {
  order: StoredOrder;
  onBack: () => void;
  onCreateNote: () => void;
}) {
  return (
    <div className="space-y-6">
      <OrderPageHeader
        title="Order detail"
        backLabel="Back to Order History"
        onBack={props.onBack}
        action={
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-[#f8fafc] px-4 text-sm font-medium text-[#111827]">Download PDF</button>
            <button type="button" onClick={props.onCreateNote} className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white text-[#111827]">+</button>
          </div>
        }
      />
      <OrderDetailSummaryBar order={props.order} />
      <div className="grid gap-6 px-9 pb-9 xl:grid-cols-[1.05fr_1.45fr]">
        <OrderDetailActivityPanel order={props.order} />
        <OrderDetailItemsPanel order={props.order} />
      </div>
    </div>
  );
}
