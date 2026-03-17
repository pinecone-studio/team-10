"use client";

import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { PlusIcon } from "./OrderCreateIcons";
import { Input } from "./OrderFormFields";

const ITEM_GRID_CLASS =
  "grid-cols-[minmax(0,1.65fr)_92px_72px_96px_96px]";
const HEADER_CELL_CLASS = "flex items-center px-[10px] py-3";

function ItemCell(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex h-8 items-center rounded-[6px] border border-[#f1f5f9] bg-white px-[13px] text-[12px] text-[#020618] shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${props.className ?? ""}`}
    />
  );
}

function DraftRow(props: {
  draft: OrderCreateViewProps["goodsDrafts"][number];
  canAdd: boolean;
  onChange: OrderCreateViewProps["onGoodsDraftChange"];
}) {
  const total = useMemo(() => {
    const quantity = Number(props.draft.quantity || 0);
    const price = Number(props.draft.unitPrice || 0);
    return formatCurrency(quantity * price, props.draft.currencyCode);
  }, [props.draft]);

  return (
    <div className={`grid ${ITEM_GRID_CLASS} items-center gap-[8px] border-b border-[#e2e8f0] px-0 py-2`}>
      <Input
        value={props.draft.itemName}
        onChange={(event) =>
          props.onChange(props.draft.id, "itemName", event.target.value)
        }
        placeholder="Item name"
        className="h-8 min-w-0 rounded-[6px] border border-transparent bg-white px-[10px] text-[12px] text-[#0f172a] placeholder:text-[#94a3b8]"
      />
      <Input
        value={props.draft.code}
        readOnly
        aria-label="Generated code"
        className="h-8 min-w-0 rounded-[6px] border border-transparent bg-[#f8fafc] px-[10px] text-[12px] font-medium text-[#0f172a]"
      />
      <Input
        value={props.draft.quantity}
        onChange={(event) =>
          props.onChange(props.draft.id, "quantity", event.target.value)
        }
        type="number"
        min="0"
        className="h-8 min-w-0 rounded-[6px] border border-transparent bg-white px-[10px] text-center text-[12px] text-[#0f172a]"
      />
      <Input
        value={props.draft.unitPrice}
        onChange={(event) =>
          props.onChange(props.draft.id, "unitPrice", event.target.value)
        }
        type="number"
        min="0"
        placeholder="0"
        className="h-8 min-w-0 rounded-[6px] border border-transparent bg-white px-[10px] text-[12px] text-[#0f172a]"
      />
      <ItemCell
        className={`justify-end px-[10px] font-medium ${props.canAdd ? "text-[#0f172a]" : "text-[#94a3b8]"}`}
      >
        {total}
      </ItemCell>
    </div>
  );
}

export function OrderCreateItemsEditor(
  props: Pick<
    OrderCreateViewProps,
    | "goodsDrafts"
    | "canAddItems"
    | "draftItems"
    | "onGoodsDraftChange"
    | "onAddItem"
    | "onUpdateItemQuantity"
  >,
) {
  const [isComposerOpen, setComposerOpen] = useState(false);
  const activeDraft = props.goodsDrafts[0];
  const canSaveDraft = Boolean(activeDraft && (props.canAddItems[0] ?? false));

  function handleAddItem() {
    if (!activeDraft) return;
    if (!isComposerOpen) {
      setComposerOpen(true);
      return;
    }
    if (!canSaveDraft) return;
    props.onAddItem(activeDraft.id);
    setComposerOpen(false);
  }

  return (
    <section className="rounded-[12px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#e2e8f0] bg-[rgba(241,245,249,0.3)] px-6 py-4">
        <h3 className="text-[16px] font-semibold leading-6 text-[#020618]">Order Items</h3>
      </div>
      <div className="px-6 py-6">
        <div className="border-b border-[#dbeafe]">
          <div className="w-full">
            <div className={`grid ${ITEM_GRID_CLASS} items-center border-b border-[#dbeafe] bg-[#eff6ff] px-0 py-0 text-[12px] font-medium text-[#64748b]`}>
              <span className={HEADER_CELL_CLASS}>Item Name</span>
              <span className={`${HEADER_CELL_CLASS} justify-center`}>Code</span>
              <span className={`${HEADER_CELL_CLASS} justify-center`}>Qty</span>
              <span className={`${HEADER_CELL_CLASS} justify-end`}>Price</span>
              <span className={`${HEADER_CELL_CLASS} justify-end`}>Total</span>
            </div>
            <div>
              {props.draftItems.map((item, index) => (
                <div
                  key={`${item.catalogId}-${index}`}
                  className={`grid ${ITEM_GRID_CLASS} items-center gap-[8px] border-b border-[#e2e8f0] py-2`}
                >
                  <ItemCell className="min-w-0 truncate">{item.name}</ItemCell>
                  <ItemCell className="min-w-0 justify-center bg-[#f8fafc] px-[10px] font-medium">{item.code}</ItemCell>
                  <Input
                    value={String(item.quantity)}
                    onChange={(event) =>
                      props.onUpdateItemQuantity(index, event.target.value)
                    }
                    type="number"
                    min="0"
                    className="h-8 min-w-0 rounded-[6px] border-transparent px-[10px] text-center text-[12px]"
                  />
                  <ItemCell className="min-w-0 justify-end px-[10px]">
                    {String(item.unitPrice)}
                  </ItemCell>
                  <ItemCell className="min-w-0 justify-end px-[10px] font-medium">
                    {formatCurrency(item.totalPrice, item.currencyCode)}
                  </ItemCell>
                </div>
              ))}
              {isComposerOpen && activeDraft ? (
                <DraftRow
                  draft={activeDraft}
                  canAdd={canSaveDraft}
                  onChange={props.onGoodsDraftChange}
                />
              ) : null}
            </div>
          </div>
        </div>
        <div className="mt-[10px] border-t border-[#dbeafe] pt-[10px]">
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex h-8 items-center justify-center gap-[6px] rounded-[6px] border border-dashed border-[rgba(79,57,246,0.4)] bg-[#f8fafc] px-[11px] text-[12px] font-medium text-black shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition duration-150 hover:bg-[#f1f5f9] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            <PlusIcon />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </section>
  );
}
