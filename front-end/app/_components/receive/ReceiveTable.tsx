"use client";

import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { ReceiveConditionBadge } from "./ReceiveConditionBadge";
import type { ReceiveRow } from "./receiveTypes";

export function ReceiveTable({
  rows,
  selectedRowIds,
  allPageRowsSelected,
  onToggleAllPageRows,
  onToggleRow,
}: {
  rows: ReceiveRow[];
  selectedRowIds: string[];
  allPageRowsSelected: boolean;
  onToggleAllPageRows: (checked: boolean) => void;
  onToggleRow: (rowId: string, checked: boolean) => void;
}) {
  return (
    <div className="mt-[18px]">
      <div className="overflow-hidden rounded-[12px] border border-[#e5e7eb] bg-white">
        <div className="grid grid-cols-[56px_28px_minmax(180px,1.6fr)_minmax(124px,0.9fr)_minmax(128px,0.9fr)_minmax(138px,0.95fr)_72px_88px_minmax(120px,0.9fr)_40px] items-center border-b border-[#e5e7eb] bg-[#f5f5f5] text-[14px] font-medium text-[#111111]">
          <div className="px-[12px] py-[16px]">№</div>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allPageRowsSelected}
              aria-label="Select page rows"
              onChange={(event) => onToggleAllPageRows(event.target.checked)}
              className="size-[16px] rounded-[4px] border border-[#d7d7d7]"
            />
          </div>
          <div className="px-[8px] py-[16px]">Asset Name</div>
          <div className="px-[8px] py-[16px]">Date of birth</div>
          <div className="px-[8px] py-[16px]">Category</div>
          <div className="px-[8px] py-[16px]">Condition</div>
          <div className="px-[8px] py-[16px] text-center">QTY</div>
          <div className="px-[8px] py-[16px] text-center">Received</div>
          <div className="px-[8px] py-[16px] text-right">Purchase Cost</div>
          <div className="py-[16px]" />
        </div>

        {rows.map((row) => {
          const isSelected = selectedRowIds.includes(row.id);

          return (
            <div
              key={row.id}
              className="grid grid-cols-[56px_28px_minmax(180px,1.6fr)_minmax(124px,0.9fr)_minmax(128px,0.9fr)_minmax(138px,0.95fr)_72px_88px_minmax(120px,0.9fr)_40px] items-center border-b border-[#eef0f3] text-[14px] text-[#171717] last:border-b-0"
            >
              <div className="px-[12px] py-[14px]">{row.index}</div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!row.selectable}
                  aria-label={`Select ${row.assetName}`}
                  onChange={(event) => onToggleRow(row.id, event.target.checked)}
                  className="size-[16px] rounded-[4px] border border-[#d7d7d7] disabled:opacity-40"
                />
              </div>
              <div className="truncate px-[8px] py-[14px] font-medium">{row.assetName}</div>
              <div className="px-[8px] py-[14px]">{formatDisplayDate(row.requestDate)}</div>
              <div className="px-[8px] py-[14px]">
                <span className="inline-flex min-h-[22px] items-center rounded-[999px] border border-[#e5e7eb] bg-white px-[8px] text-[12px] text-[#737373]">
                  {row.category}
                </span>
              </div>
              <div className="px-[8px] py-[14px]">
                <ReceiveConditionBadge condition={row.condition} />
              </div>
              <div className="px-[8px] py-[14px] text-center">{row.quantity}</div>
              <div className="px-[8px] py-[14px] text-center">{row.received}</div>
              <div className="px-[8px] py-[14px] text-right">{formatCurrency(row.purchaseCost)}</div>
              <div className="flex items-center justify-center py-[14px] text-[#737373]">⋮</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
