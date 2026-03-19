"use client";

import { useMemo } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { ChevronDownIcon, ItemCubeIcon } from "./OrderCreateIcons";
import { Input, Select } from "./OrderFormFields";

export const ORDER_ITEMS_GRID =
  "grid-cols-[24px_minmax(0,1.55fr)_minmax(84px,0.78fr)_minmax(138px,0.98fr)_70px_88px_36px]";
export const ORDER_ITEMS_HEADER = "flex items-center px-[6px] py-2.5";
const UNITS = ["pcs", "ream", "box", "pack", "unit"] as const;

function TrashIcon({ active = false }: { active?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[14px] w-[14px]" aria-hidden="true">
      <path d="M6.5 4.5h7M8 4.5V3.8c0-.44.36-.8.8-.8h2.4c.44 0 .8.36.8.8v.7M4.5 6h11l-.7 9.1c-.05.8-.72 1.4-1.52 1.4H6.72c-.8 0-1.47-.61-1.52-1.4L4.5 6Z" stroke={active ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8.5 9v4.5M11.5 9v4.5" stroke={active ? "#ef4444" : "#94a3b8"} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`flex h-10 items-center rounded-[10px] border border-[#edf4fb] bg-white px-[10px] text-[12px] text-[#020618] shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${className}`}>{children}</div>;
}

export function OrderCreateItemsHeader() {
  return (
    <div className={`grid ${ORDER_ITEMS_GRID} items-center border-b border-[#dbeafb] bg-[#f3f8ff] text-[12px] font-medium text-[#64748b]`}>
      <span />
      <span className={ORDER_ITEMS_HEADER}>Item Name</span>
      <span className={ORDER_ITEMS_HEADER}>Code</span>
      <span className={`${ORDER_ITEMS_HEADER} -translate-x-[6px] justify-center`}>Qty</span>
      <span className={ORDER_ITEMS_HEADER}>Price</span>
      <span className={`${ORDER_ITEMS_HEADER} justify-center`}>Total</span>
      <span className={`${ORDER_ITEMS_HEADER} justify-center`}>Action</span>
    </div>
  );
}

export function OrderCreateItemRow({
  draft,
  canAdd,
  onChange,
  onQuantityChange,
  onRemove,
}: {
  draft: OrderCreateViewProps["goodsDrafts"][number];
  canAdd: boolean;
  onChange: OrderCreateViewProps["onGoodsDraftChange"];
  onQuantityChange: OrderCreateViewProps["onUpdateItemQuantity"];
  onRemove: OrderCreateViewProps["onRemoveItem"];
}) {
  const total = useMemo(() => formatCurrency(Number(draft.quantity || 0) * Number(draft.unitPrice || 0), draft.currencyCode), [draft]);
  const hasValue = Boolean(draft.itemName.trim() || draft.code.trim() || draft.unitPrice.trim());

  return (
    <div className={`grid ${ORDER_ITEMS_GRID} items-center gap-[5px] border-b border-[#dbeafb] py-2`}>
      <div className="flex items-center justify-center"><ItemCubeIcon /></div>
      <Input value={draft.itemName} onChange={(e) => onChange(draft.id, "itemName", e.target.value)} placeholder="Item name" className="h-9 min-w-0 rounded-[10px] border-[#edf4fb] px-[9px] text-[12px] text-[#0f172a] placeholder:text-[#94a3b8]" />
      <Input value={draft.code} readOnly aria-label="Generated code" className="h-9 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[9px] text-[12px] font-medium text-[#64748b]" />
      <div className="flex min-w-0 items-center gap-[4px]">
        <Input value={draft.quantity} onChange={(e) => onQuantityChange(draft.id, e.target.value)} type="number" min="0" className="h-9 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[6px] text-center text-[12px] text-[#0f172a]" />
        <div className="relative w-[68px] shrink-0">
          <Select value={draft.unit} onChange={(e) => onChange(draft.id, "unit", e.target.value)} className="h-9 min-w-0 appearance-none rounded-[10px] border-[#edf4fb] bg-white px-[8px] pr-7 text-[11px] text-[#475569]">
            {UNITS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </Select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"><ChevronDownIcon /></span>
        </div>
      </div>
      <Input value={draft.unitPrice} onChange={(e) => onChange(draft.id, "unitPrice", e.target.value)} type="number" min="0" placeholder="0" className="h-9 min-w-0 rounded-[10px] border-[#edf4fb] bg-white px-[8px] text-[12px] text-[#0f172a]" />
      <Cell className={`h-9 justify-center px-[8px] text-[12px] font-medium ${canAdd ? "text-[#0f172a]" : "text-[#94a3b8]"}`}>{total}</Cell>
      <div className="flex items-center justify-center">
        <button type="button" onClick={() => onRemove(draft.id)} disabled={!draft.itemName.trim() && !draft.unitPrice.trim()} className="inline-flex h-7 w-7 items-center justify-center rounded-[10px] bg-transparent text-[#94a3b8] transition hover:bg-[#fff1f2] hover:text-[#ef4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#fecdd3] focus-visible:ring-offset-2 disabled:cursor-default disabled:text-[#cbd5e1] disabled:hover:bg-transparent" aria-label="Remove item row">
          <TrashIcon active={hasValue} />
        </button>
      </div>
    </div>
  );
}
