"use client";

import type { StoredOrder } from "../../_lib/order-store";
import { OrderDetailActivityPanel } from "./OrderDetailActivityPanel";
import { OrderDetailItemsPanel } from "./OrderDetailItemsPanel";
import { OrderDetailSummaryBar } from "./OrderDetailSummaryBar";
import { OrderNotificationButton } from "./OrderNotificationButton";
import { OrderPageHeader } from "./OrderPageHeader";

export function OrderDetailView(props: {
  order: StoredOrder;
  onBack: () => void;
  onOpenDetail: (orderId: string) => void;
  onCreateNote: () => void;
  onDeleteOrder: (orderId: string) => void | Promise<void>;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#ffffff_100%)] pt-[60px]">
      <OrderPageHeader
        title="Order detail"
        backLabel="Back to Order History"
        onBack={props.onBack}
        action={
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[10px] border border-[#dbeafb] bg-white px-4 text-sm font-medium text-[#111827] shadow-[0_8px_18px_rgba(15,23,42,0.04)] transition duration-150 hover:bg-[#f8fbff] active:scale-[0.98] active:bg-[#eef2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">Download PDF</button>
            <OrderNotificationButton onOpenDetail={props.onOpenDetail} />
          </div>
        }
      />
      <div className="border-t border-[#d9e9fb]" />
      <OrderDetailSummaryBar order={props.order} />
      <div className="grid gap-6 px-[40px] pb-12 pt-8 xl:grid-cols-[0.95fr_1.35fr]">
        <OrderDetailActivityPanel order={props.order} />
        <OrderDetailItemsPanel order={props.order} />
      </div>
    </div>
  );
}
