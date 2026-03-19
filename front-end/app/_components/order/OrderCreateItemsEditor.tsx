"use client";

import { useEffect, useRef } from "react";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { PlusIcon } from "./OrderCreateIcons";
import { OrderCreateItemsHeader, OrderCreateItemRow } from "./OrderCreateItemsTableParts";

export function OrderCreateItemsEditor(
  props: Pick<
    OrderCreateViewProps,
    | "goodsDrafts"
    | "canAddItems"
    | "onGoodsDraftChange"
    | "onAddItem"
    | "onRemoveItem"
    | "onUpdateItemQuantity"
  >,
) {
  const rowsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = rowsRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [props.goodsDrafts.length]);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[#dbeafb] px-8 pb-10 pt-8">
      <h3 className="text-[14px] font-semibold leading-7 text-[#111827]">
        Order Items
      </h3>
      <div className="mt-4 flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-b border-[#dbeafb]">
          <div className="shrink-0">
            <OrderCreateItemsHeader />
          </div>
          <div ref={rowsRef} className="min-h-0 flex-1 overflow-y-auto">
            <div className="pr-1">
              {props.goodsDrafts.map((draft, index) => (
                <OrderCreateItemRow
                  key={draft.id}
                  draft={draft}
                  canAdd={props.canAddItems[index] ?? false}
                  onChange={props.onGoodsDraftChange}
                  onQuantityChange={props.onUpdateItemQuantity}
                  onRemove={props.onRemoveItem}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 shrink-0 bg-white">
          <button
            type="button"
            onClick={props.onAddItem}
            className="inline-flex h-9 items-center justify-center gap-[7px] rounded-[10px] border border-dashed border-[#a5b4fc] bg-white px-3.5 text-[13px] font-semibold text-[#111827] shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-150 hover:bg-[#f8fbff] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            <PlusIcon />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </section>
  );
}
