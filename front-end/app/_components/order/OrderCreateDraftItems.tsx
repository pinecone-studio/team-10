"use client";

import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { CubeIcon } from "./OrderCreateIcons";

type OrderCreateDraftItemsTableProps = Pick<
  OrderCreateViewProps,
  "draftItems" | "onRemoveItem" | "onUpdateItemQuantity" | "summaryTotal"
> & {
  onEditProduct: (productId: string) => void;
};

export function OrderCreateDraftItemsTable({
  draftItems,
  onRemoveItem,
  onUpdateItemQuantity,
  summaryTotal,
  onEditProduct,
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
            <button
              type="button"
              onClick={() => onEditProduct(item.catalogId)}
              className="cursor-pointer text-left text-[#111827] underline decoration-transparent underline-offset-[3px] transition hover:decoration-current"
            >
              {item.name}
            </button>
            <span>{item.code}</span>
            <input
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              onChange={(event) =>
                onUpdateItemQuantity(index, event.target.value)
              }
              className="h-[34px] w-[72px] rounded-[6px] border border-[#d7d7da] bg-[#f7f8fa] px-[10px] text-[14px] text-[#111827] outline-none"
              aria-label={`Quantity for ${item.name}`}
            />
            <span>{item.unit}</span>
            <span>{formatCurrency(item.unitPrice, item.currencyCode)}</span>
            <span>{formatCurrency(item.totalPrice, item.currencyCode)}</span>
            <button
              type="button"
              onClick={() => onRemoveItem(index)}
              className="cursor-pointer text-[#6d6d6d]"
            >
              X
            </button>
          </div>
        ))}
      </div>
      <div className="mt-[10px] flex items-center justify-between rounded-[6px] bg-[#dbdcdf] px-[14px] py-[12px] text-[16px] font-semibold text-[#161616]">
        <span>Total:</span>
        <span>{formatCurrency(summaryTotal, draftItems[0]?.currencyCode ?? "MNT")}</span>
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
