"use client";

import { InputField, TextInput } from "./OrderPrimitives";
import { OrderCatalogPicker } from "./OrderCatalogPicker";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import type { GoodsDraft } from "./orderHelpers";

type OrderCreateGoodsDraftRowProps = {
  goodsDraft: GoodsDraft;
  totalDrafts: number;
  isLastRow: boolean;
  canAddItem: boolean;
  onSelectCatalogProduct: OrderCreateViewProps["onSelectCatalogProduct"];
  onQuantityChange: OrderCreateViewProps["onQuantityChange"];
  onAddItem: OrderCreateViewProps["onAddItem"];
  onAddDraftRow: OrderCreateViewProps["onAddDraftRow"];
  onRemoveDraftRow: OrderCreateViewProps["onRemoveDraftRow"];
};

export function OrderCreateGoodsDraftRow({
  goodsDraft,
  totalDrafts,
  isLastRow,
  canAddItem,
  onSelectCatalogProduct,
  onQuantityChange,
  onAddItem,
  onAddDraftRow,
  onRemoveDraftRow,
}: OrderCreateGoodsDraftRowProps) {
  return (
    <div className="grid gap-[12px] xl:grid-cols-[minmax(0,1fr)_96px_auto] xl:items-end">
      <InputField label="Add goods">
        <div className="max-w-[154px]">
          <OrderCatalogPicker
            selectedCatalogProductId={goodsDraft.selectedCatalogProductId}
            onSelectCatalogProduct={(productId) =>
              onSelectCatalogProduct(goodsDraft.id, productId)
            }
          />
        </div>
      </InputField>
      <InputField label="Quantity">
        <TextInput
          type="number"
          value={goodsDraft.quantity}
          onChange={(event) => onQuantityChange(goodsDraft.id, event.target.value)}
        />
      </InputField>
      <div className="flex flex-wrap items-end gap-[8px] xl:justify-end">
        <button
          type="button"
          onClick={() => onAddItem(goodsDraft.id)}
          disabled={!canAddItem}
          className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[6px] bg-[#111827] px-[22px] text-[12px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add
        </button>
        {isLastRow ? (
          <button
            type="button"
            onClick={onAddDraftRow}
            className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#b5b8bf] bg-[#ececef] px-[14px] text-[12px]"
          >
            + Row
          </button>
        ) : null}
        {totalDrafts > 1 ? (
          <button
            type="button"
            onClick={() => onRemoveDraftRow(goodsDraft.id)}
            className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[6px] border border-[#d5b0af] bg-[#f6ebeb] px-[14px] text-[13px] text-[#9d5d5d]"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
