"use client";

import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { OrderCreateDraftItemsTable, OrderCreateEmptyDraftItemsState } from "./OrderCreateDraftItems";
import { OrderCreateGoodsDraftRow } from "./OrderCreateGoodsDraftRow";

type OrderCreateGoodsSectionProps = Pick<
  OrderCreateViewProps,
  | "goodsDrafts"
  | "draftItems"
  | "canAddItems"
  | "onSelectSuggestion"
  | "onQuantityChange"
  | "onUnitPriceChange"
  | "onAddItem"
  | "onAddDraftRow"
  | "onRemoveDraftRow"
  | "onRemoveItem"
>;

export function OrderCreateGoodsSection({
  goodsDrafts,
  draftItems,
  canAddItems,
  onSelectSuggestion,
  onQuantityChange,
  onUnitPriceChange,
  onAddItem,
  onAddDraftRow,
  onRemoveDraftRow,
  onRemoveItem,
}: OrderCreateGoodsSectionProps) {
  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
      <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[14px]">
        <h3 className="text-[18px] font-semibold text-[#111111]">
          Custom goods
        </h3>
        <span className="text-[12px] text-[#8f8f8f]">
          {draftItems.length} item
        </span>
      </div>

      <div className="mt-[14px] text-[12px] rounded-[6px] border border-[#d6d6da] bg-[#dcdde0] px-[10px] py-[10px]">
        {goodsDrafts.map((goodsDraft, index) => (
          <OrderCreateGoodsDraftRow
            key={goodsDraft.id}
            goodsDraft={goodsDraft}
            index={index}
            totalDrafts={goodsDrafts.length}
            canAddItem={canAddItems[index]}
            onSelectSuggestion={onSelectSuggestion}
            onQuantityChange={onQuantityChange}
            onUnitPriceChange={onUnitPriceChange}
            onAddItem={onAddItem}
            onAddDraftRow={onAddDraftRow}
            onRemoveDraftRow={onRemoveDraftRow}
          />
        ))}
      </div>

      <div className="mt-[20px]">
        {draftItems.length > 0 ? (
          <OrderCreateDraftItemsTable
            draftItems={draftItems}
            onRemoveItem={onRemoveItem}
          />
        ) : (
          <OrderCreateEmptyDraftItemsState />
        )}
      </div>
    </section>
  );
}
