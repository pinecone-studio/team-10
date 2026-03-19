"use client";

import type { ComponentProps } from "react";
import { useMemo } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { ChevronDownIcon, ItemCubeIcon, PlusIcon } from "./OrderCreateIcons";
import { Input, Select } from "./OrderFormFields";

const ITEM_GRID_CLASS =
  "grid-cols-[32px_minmax(170px,1.45fr)_minmax(108px,0.82fr)_56px_96px_72px_110px_44px]";
const HEADER_CELL_CLASS = "flex items-center px-[8px] py-2.5";
const TABLE_MIN_WIDTH_CLASS = "min-w-[760px]";
const UNIT_OPTIONS = ["pcs", "ream", "box", "pack", "unit"] as const;

function ItemCell(props: ComponentProps<"div">) {
  return (
    <div
      {...props}
      className={`flex h-10 items-center rounded-[10px] border border-[#edf4fb] bg-white px-[10px] text-[12px] text-[#020618] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${props.className ?? ""}`}
    />
  );
}

function TrashIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[14px] w-[14px]" aria-hidden="true">
      <path
        d="M6.5 4.5h7M8 4.5V3.8c0-.44.36-.8.8-.8h2.4c.44 0 .8.36.8.8v.7M4.5 6h11l-.7 9.1c-.05.8-.72 1.4-1.52 1.4H6.72c-.8 0-1.47-.61-1.52-1.4L4.5 6Z"
        stroke={active ? "#ef4444" : "#94a3b8"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 9v4.5M11.5 9v4.5"
        stroke={active ? "#ef4444" : "#94a3b8"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DraftRow(props: {
  draft: OrderCreateViewProps["goodsDrafts"][number];
  canAdd: boolean;
  onChange: OrderCreateViewProps["onGoodsDraftChange"];
  onQuantityChange: OrderCreateViewProps["onUpdateItemQuantity"];
  onRemove: OrderCreateViewProps["onRemoveItem"];
}) {
  const total = useMemo(() => {
    const quantity = Number(props.draft.quantity || 0);
    const price = Number(props.draft.unitPrice || 0);
    return formatCurrency(quantity * price, props.draft.currencyCode);
  }, [props.draft]);

  return (
    <div className={`grid ${TABLE_MIN_WIDTH_CLASS} ${ITEM_GRID_CLASS} items-center gap-[6px] border-b border-[#dbeafb] px-0 py-2.5`}>
      <div className="flex items-center justify-center">
        <ItemCubeIcon />
      </div>
      <Input
        value={props.draft.itemName}
        onChange={(event) =>
          props.onChange(props.draft.id, "itemName", event.target.value)
        }
        placeholder="Item name"
        className="h-10 min-w-0 rounded-[10px] border-[#edf4fb] px-[10px] text-[13px] text-[#0f172a] placeholder:text-[#94a3b8]"
      />
      <Input
        value={props.draft.code}
        readOnly
        aria-label="Generated code"
        className="h-10 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[10px] text-[13px] font-medium text-[#64748b]"
      />
      <Input
        value={props.draft.quantity}
        onChange={(event) =>
          props.onQuantityChange(props.draft.id, event.target.value)
        }
        type="number"
        min="0"
        className="h-10 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[8px] text-center text-[13px] text-[#0f172a]"
      />
      <div className="relative">
        <Select
          value={props.draft.unit}
          onChange={(event) =>
            props.onChange(props.draft.id, "unit", event.target.value)
          }
          className="h-10 min-w-0 appearance-none rounded-[10px] border-[#edf4fb] bg-white px-[10px] text-[13px] text-[#475569]"
        >
          {UNIT_OPTIONS.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </Select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <ChevronDownIcon />
        </span>
      </div>
      <Input
        value={props.draft.unitPrice}
        onChange={(event) =>
          props.onChange(props.draft.id, "unitPrice", event.target.value)
        }
        type="number"
        min="0"
        placeholder="0"
        className="h-10 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[8px] text-[13px] text-[#0f172a]"
      />
      <ItemCell
        className={`justify-end px-[10px] text-[13px] font-medium ${props.canAdd ? "text-[#0f172a]" : "text-[#94a3b8]"}`}
      >
        {total}
      </ItemCell>
      <div className="flex items-center justify-center">
        <button
          type="button"
          onClick={() => props.onRemove(props.draft.id)}
          disabled={!props.draft.itemName.trim() && !props.draft.unitPrice.trim()}
          className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-transparent text-[#94a3b8] transition hover:bg-[#fff1f2] hover:text-[#ef4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fecdd3] focus-visible:ring-offset-2 disabled:cursor-default disabled:text-[#cbd5e1] disabled:hover:bg-transparent"
          aria-label="Remove item row"
        >
          <TrashIcon active={Boolean(props.draft.itemName.trim() || props.draft.code.trim() || props.draft.unitPrice.trim())} />
        </button>
      </div>
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
    | "onRemoveItem"
    | "onUpdateItemQuantity"
  >,
) {
  function handleAddItem() {
    props.onAddItem();
  }

  return (
    <section className="flex flex-1 flex-col border-t border-[#dbeafb] px-8 pb-10 pt-8">
      <div>
        <h3 className="text-[18px] font-semibold leading-7 text-[#111827]">Order Items</h3>
      </div>
      <div className="mt-4 flex flex-1 flex-col">
        <div className="flex-1 border-b border-[#dbeafb]">
          <div className="w-full overflow-x-auto pb-1">
            <div className={`grid ${TABLE_MIN_WIDTH_CLASS} ${ITEM_GRID_CLASS} items-center border-b border-[#dbeafb] bg-[#f3f8ff] px-0 py-0 text-[12px] font-medium text-[#64748b]`}>
              <span />
              <span className={HEADER_CELL_CLASS}>Item Name</span>
              <span className={HEADER_CELL_CLASS}>Code</span>
              <span className={`${HEADER_CELL_CLASS} justify-center`}>Qty</span>
              <span className={HEADER_CELL_CLASS}>Unit</span>
              <span className={`${HEADER_CELL_CLASS} justify-start`}>Price</span>
              <span className={`${HEADER_CELL_CLASS} justify-end`}>Total</span>
              <span className={`${HEADER_CELL_CLASS} justify-center`}>Action</span>
            </div>
            <div>
              {props.goodsDrafts.map((draft, index) => (
                <DraftRow
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
        <div className="mt-5 pt-0">
          <button
            type="button"
            onClick={handleAddItem}
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
