"use client";

import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { ItemCubeIcon, PlusIcon } from "./OrderCreateIcons";
import { Input } from "./OrderFormFields";

function ItemCell(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex h-[50px] items-center rounded-[14px] border border-[#edf2f7] bg-white px-5 text-[12px] text-[#0f172a] shadow-[0_1px_4px_rgba(15,23,42,0.03)] ${props.className ?? ""}`}
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
    <div className="grid grid-cols-[52px_1.8fr_1.15fr_0.8fr_1.05fr_0.7fr_0.95fr] items-center gap-4 px-5 py-5">
      <span className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[14px] border border-[#edf2f7] bg-[#f8fbff]">
        <ItemCubeIcon />
      </span>
      <Input
        value={props.draft.itemName}
        onChange={(event) =>
          props.onChange(props.draft.id, "itemName", event.target.value)
        }
        placeholder="Item name"
        className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
      />
      <Input
        value={props.draft.code}
        onChange={(event) =>
          props.onChange(props.draft.id, "code", event.target.value)
        }
        placeholder="Code"
        className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
      />
      <Input
        value={props.draft.quantity}
        onChange={(event) =>
          props.onChange(props.draft.id, "quantity", event.target.value)
        }
        type="number"
        min="0"
        className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
      />
      <Input
        value={props.draft.unit}
        onChange={(event) =>
          props.onChange(props.draft.id, "unit", event.target.value)
        }
        placeholder="Unit"
        className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
      />
      <Input
        value={props.draft.unitPrice}
        onChange={(event) =>
          props.onChange(props.draft.id, "unitPrice", event.target.value)
        }
        type="number"
        min="0"
        placeholder="0"
        className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
      />
      <ItemCell
        className={`justify-end px-4 font-medium ${props.canAdd ? "" : "text-[#94a3b8]"}`}
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
    <section className="rounded-[20px] border border-[#d9e0e8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-[#e8eef5] px-7 py-6">
        <h3 className="text-[18px] font-semibold text-[#0f172a]">Order Items</h3>
      </div>
      <div className="px-7 py-6">
        <div className="overflow-hidden border-y border-[#dbe6f3]">
          <div className="grid grid-cols-[2fr_1.15fr_0.8fr_1fr_0.7fr_0.95fr] bg-[#eaf3ff] px-5 py-6 text-[12px] font-medium text-[#64748b]">
            <span>Item Name</span>
            <span>Code</span>
            <span>Qty</span>
            <span>Unit</span>
            <span>Price</span>
            <span className="text-right">Total</span>
          </div>
          <div className="divide-y divide-[#dbe6f3]">
            {props.draftItems.map((item, index) => (
              <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[52px_1.8fr_1.15fr_0.8fr_1.05fr_0.7fr_0.95fr] items-center gap-4 px-5 py-5">
                <span className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-[14px] bg-[#f8fbff]">
                  <ItemCubeIcon />
                </span>
                <ItemCell>{item.name}</ItemCell>
                <ItemCell>{item.code}</ItemCell>
                <Input
                  value={String(item.quantity)}
                  onChange={(event) =>
                    props.onUpdateItemQuantity(index, event.target.value)
                  }
                  type="number"
                  min="0"
                  className="h-[50px] rounded-[14px] border-[#edf2f7] px-5 text-[12px]"
                />
                <ItemCell>{item.unit}</ItemCell>
                <ItemCell>{String(item.unitPrice)}</ItemCell>
                <ItemCell className="justify-end px-4 font-medium">
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
        <div className="mt-5 border-t border-[#dbe6f3] pt-5">
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex h-[46px] items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#a5b4fc] px-5 text-[12px] font-medium text-[#0f172a] transition duration-150 hover:bg-[#f8faff] active:scale-[0.98] active:bg-[#eef2ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            <PlusIcon />
            <span>Add Item</span>
          </button>
        </div>
      </div>
    </section>
  );
}
