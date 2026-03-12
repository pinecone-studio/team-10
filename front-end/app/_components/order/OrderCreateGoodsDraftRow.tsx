"use client";

import { goodsCatalog } from "../../_lib/order-store";
import type { GoodsDraft } from "./orderHelpers";
import { InputField, SelectInput, TextInput } from "./OrderPrimitives";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

type OrderCreateGoodsDraftRowProps = {
  goodsDraft: GoodsDraft;
  index: number;
  totalDrafts: number;
  canAddItem: boolean;
  onSelectSuggestion: OrderCreateViewProps["onSelectSuggestion"];
  onQuantityChange: OrderCreateViewProps["onQuantityChange"];
  onUnitPriceChange: OrderCreateViewProps["onUnitPriceChange"];
  onAddItem: OrderCreateViewProps["onAddItem"];
  onAddDraftRow: OrderCreateViewProps["onAddDraftRow"];
  onRemoveDraftRow: OrderCreateViewProps["onRemoveDraftRow"];
};

export function OrderCreateGoodsDraftRow({
  goodsDraft,
  index,
  totalDrafts,
  canAddItem,
  onSelectSuggestion,
  onQuantityChange,
  onUnitPriceChange,
  onAddItem,
  onAddDraftRow,
  onRemoveDraftRow,
}: OrderCreateGoodsDraftRowProps) {
  return (
    <div className="grid grid-cols-[1.3fr_0.35fr_0.4fr_auto] items-end gap-[10px]">
      <InputField
        label={`Select goods${totalDrafts > 1 ? ` ${index + 1}` : ""}`}
      >
        <SelectInput
          value={goodsDraft.selectedItem?.id ?? ""}
          onChange={(event) =>
            onSelectSuggestion(goodsDraft.id, event.target.value)
          }
        >
          <option value="">Search for goods...</option>
          {goodsCatalog.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </SelectInput>
      </InputField>
      <InputField label="Quantity">
        <TextInput
          type="number"
          value={goodsDraft.quantity}
          onChange={(event) => onQuantityChange(goodsDraft.id, event.target.value)}
        />
      </InputField>
      <InputField label="Unit price">
        <TextInput
          type="number"
          value={goodsDraft.unitPrice}
          onChange={(event) =>
            onUnitPriceChange(goodsDraft.id, event.target.value)
          }
        />
      </InputField>
      <div className="flex gap-[8px]">
        <button
          type="button"
          onClick={() => onAddItem(goodsDraft.id)}
          disabled={!canAddItem}
          className="inline-flex h-[31px] items-center justify-center rounded-[6px] bg-[#9ea0a6] px-[20px] text-[12px] font-medium text-white disabled:opacity-50"
        >
          + Add
        </button>
        {index === totalDrafts - 1 ? (
          <button
            type="button"
            onClick={onAddDraftRow}
            className="inline-flex h-[31px] items-center justify-center rounded-[6px] border border-[#b5b8bf] bg-[#ececef] px-[14px] text-[12px]"
          >
            + Row
          </button>
        ) : null}
        {totalDrafts > 1 ? (
          <button
            type="button"
            onClick={() => onRemoveDraftRow(goodsDraft.id)}
            className="inline-flex h-[31px] items-center justify-center rounded-[6px] border border-[#d5b0af] bg-[#f6ebeb] px-[14px] text-[13px] text-[#9d5d5d]"
          >
            Remove
          </button>
        ) : null}
      </div>
    </div>
  );
}
