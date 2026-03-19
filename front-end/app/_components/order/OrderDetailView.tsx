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
  onDeleteOrder: (orderId: string) => void | Promise<void>;
}) {
  const canDeletePendingOrder =
    props.order.status === "pending_finance";

  return (
    <div className="space-y-6">
      <OrderPageHeader
        title="Order detail"
        backLabel="Back to Order History"
        onBack={props.onBack}
        action={
          <div className="flex items-center gap-3">
            {canDeletePendingOrder ? (
              <button
                type="button"
                onClick={() => void props.onDeleteOrder(props.order.id)}
                className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-4 text-sm font-medium text-[#dc2626] transition duration-150 hover:border-[#fda4af] hover:bg-[#ffe4e6] active:scale-[0.98] active:bg-[#ffe4e6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fecdd3] focus-visible:ring-offset-2"
              >
                Delete Order
              </button>
            ) : null}
            <button type="button" className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-[#f8fafc] px-4 text-sm font-medium text-[#111827] transition duration-150 hover:bg-white active:scale-[0.98] active:bg-[#eef2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">Download PDF</button>
            <button type="button" onClick={props.onCreateNote} className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white text-[#111827] transition duration-150 hover:bg-[#f8fafc] active:scale-[0.98] active:bg-[#eef2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">+</button>
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
