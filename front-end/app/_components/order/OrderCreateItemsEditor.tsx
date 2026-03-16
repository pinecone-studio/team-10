"use client";

import { useCatalogStore } from "../../_lib/catalog-store";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { Input, Select } from "./OrderFormFields";

function DraftRow(props: {
  draft: OrderCreateViewProps["goodsDrafts"][number];
  canAdd: boolean;
  onSelectProduct: (productId: string) => void;
  onQuantityChange: (value: string) => void;
  onAddItem: () => void;
  onRemoveDraft: () => void;
}) {
  const catalog = useCatalogStore();
  const selectedProduct = catalog.products.find(
    (product) => product.id === props.draft.selectedCatalogProductId,
  );

  return (
    <div className="grid gap-3 rounded-[14px] border border-[#e2e8f0] bg-[#f8fafc] p-4 lg:grid-cols-[1.8fr_0.8fr_0.8fr_0.9fr_auto_auto]">
      <Select
        value={props.draft.selectedCatalogProductId ?? ""}
        onChange={(event) => props.onSelectProduct(event.target.value)}
      >
        <option value="">Select product</option>
        {catalog.products.map((product) => (
          <option key={product.id} value={product.id}>
            {product.name}
          </option>
        ))}
      </Select>
      <Input value={selectedProduct?.code ?? ""} readOnly placeholder="Code" />
      <Input
        value={props.draft.quantity}
        onChange={(event) => props.onQuantityChange(event.target.value)}
        placeholder="Qty"
        type="number"
      />
      <Input value={selectedProduct?.unit ?? ""} readOnly placeholder="Unit" />
      <button
        type="button"
        onClick={props.onAddItem}
        disabled={!props.canAdd}
        className="inline-flex h-12 items-center justify-center rounded-[10px] bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Add item
      </button>
      <button
        type="button"
        onClick={props.onRemoveDraft}
        className="inline-flex h-12 items-center justify-center rounded-[10px] border border-[#d9e0e8] px-4 text-sm text-[#64748b]"
      >
        Remove
      </button>
    </div>
  );
}

export function OrderCreateItemsEditor(
  props: Pick<
    OrderCreateViewProps,
    | "goodsDrafts"
    | "canAddItems"
    | "draftItems"
    | "onSelectCatalogProduct"
    | "onQuantityChange"
    | "onAddItem"
    | "onAddDraftRow"
    | "onRemoveDraftRow"
    | "onUpdateItemQuantity"
    | "onRemoveItem"
  >,
) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-[14px] font-semibold text-[#111827]">
          Order Items
        </h4>
        <button
          type="button"
          onClick={props.onAddDraftRow}
          className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#cbd5e1] px-4 text-sm font-medium text-[#111827]"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-3">
        {props.goodsDrafts.map((draft, index) => (
          <DraftRow
            key={draft.id}
            draft={draft}
            canAdd={props.canAddItems[index] ?? false}
            onSelectProduct={(productId) =>
              props.onSelectCatalogProduct(draft.id, productId)
            }
            onQuantityChange={(value) =>
              props.onQuantityChange(draft.id, value)
            }
            onAddItem={() => props.onAddItem(draft.id)}
            onRemoveDraft={() => props.onRemoveDraftRow(draft.id)}
          />
        ))}
      </div>
      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e2e8f0]">
        <div className="grid grid-cols-[1.6fr_1.1fr_0.7fr_0.7fr_0.8fr_1fr_44px] bg-[#eff6ff] px-3 py-3 text-xs font-medium uppercase tracking-[0.02em] text-[#64748b]">
          <span>Item Name</span>
          <span>Code</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Price</span>
          <span className="text-right">Total</span>
          <span />
        </div>
        {props.draftItems.length > 0 ? (
          props.draftItems.map((item, index) => (
            <div
              key={`${item.catalogId}-${index}`}
              className="grid grid-cols-[1.6fr_1.1fr_0.7fr_0.7fr_0.8fr_1fr_44px] items-center gap-2 border-t border-[#eef2f6] px-3 py-3 text-sm text-[#334155]"
            >
              <span>{item.name}</span>
              <span>{item.code}</span>
              <Input
                value={String(item.quantity)}
                onChange={(event) =>
                  props.onUpdateItemQuantity(index, event.target.value)
                }
                className="h-9 px-3 text-center"
              />
              <span>{item.unit}</span>
              <span>{item.unitPrice}</span>
              <span className="text-right font-medium">
                {formatCurrency(item.totalPrice, item.currencyCode)}
              </span>
              <button
                type="button"
                onClick={() => props.onRemoveItem(index)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-[#fecaca] text-[#dc2626]"
              >
                x
              </button>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center text-sm text-[#94a3b8]">
            Added items will appear here.
          </div>
        )}
      </div>
    </div>
  );
}
