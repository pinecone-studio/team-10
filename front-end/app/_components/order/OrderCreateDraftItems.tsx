"use client";

import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { CubeIcon } from "./OrderCreateIcons";

type OrderCreateDraftItemsTableProps = Pick<
  OrderCreateViewProps,
  "draftItems" | "onRemoveItem"
>;

export function OrderCreateDraftItemsTable({
  draftItems,
  onRemoveItem,
}: OrderCreateDraftItemsTableProps) {
  return (
    <>
      <div className="grid grid-cols-[1.2fr_0.8fr_0.65fr_0.65fr_0.8fr_0.8fr_0.4fr] gap-[12px] border-b border-[#d4d4d8] pb-[10px] text-[13px] text-[#7a7a7a]">
        <span>Product name</span>
        <span>Code</span>
        <span>Quantity</span>
        <span>Unit</span>
        <span>Unit price</span>
        <span>Total</span>
        <span />
      </div>
      <div className="mt-[10px] space-y-[8px]">
        {draftItems.map((item, index) => (
          <div
            key={`${item.catalogId}-${index}`}
            className="grid grid-cols-[1.2fr_0.8fr_0.65fr_0.65fr_0.8fr_0.8fr_0.4fr] items-center gap-[12px] rounded-[6px] border border-[#d7d7da] px-[12px] py-[11px] text-[15px]"
          >
            <span>{item.name}</span>
            <span>{item.code}</span>
            <span>{item.quantity}</span>
            <span>{item.unit}</span>
            <span>{formatCurrency(item.unitPrice)}</span>
            <span>{formatCurrency(item.totalPrice)}</span>
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className="text-[#6d6d6d]"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function OrderCreateEmptyDraftItemsState() {
  return (
    <div className="flex min-h-[165px] flex-col items-center justify-center text-center text-[#888888]">
      <CubeIcon />
      <p className="mt-[12px] text-[18px] leading-[1.25]">
        The item has not been added.
      </p>
      <p className="text-[18px] leading-[1.25]">
        Please select and add items from the form above.
      </p>
    </div>
  );
}
