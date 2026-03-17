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
      <div className="overflow-hidden rounded-[12px] border border-[#dcdfe4] bg-white">
        <div className="grid grid-cols-[40px_24px_minmax(220px,1.9fr)_148px_149px_108px_82px_82px_minmax(132px,1fr)_50px] items-center border-b border-[#e6e8ec] bg-[#f8f8f8] text-[14px] font-medium text-[#111827]">
          <div className="px-[10px] py-[10px]">№</div>
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allPageRowsSelected}
              aria-label="Select page rows"
              onChange={(event) => onToggleAllPageRows(event.target.checked)}
              className="size-[16px] rounded-[4px] border border-[#d0d5dd] accent-[#101828]"
            />
          </div>
          <div className="px-[8px] py-[10px]">Asset Name</div>
          <div className="px-[8px] py-[10px]">Expected Date</div>
          <div className="px-[8px] py-[10px]">Category</div>
          <div className="px-[8px] py-[10px]">Status</div>
          <div className="px-[8px] py-[10px] text-center">Quantity</div>
          <div className="px-[8px] py-[10px] text-center">Received</div>
          <div className="px-[8px] py-[10px] text-right">Purchase Cost</div>
          <div className="py-[10px]" />
        </div>

        {rows.map((row) => {
          const isSelected = selectedRowIds.includes(row.id);

          return (
            <div
              key={row.id}
              className="grid grid-cols-[40px_24px_minmax(220px,1.9fr)_148px_149px_108px_82px_82px_minmax(132px,1fr)_50px] items-center border-b border-[#e6e8ec] text-[14px] text-[#111827] last:border-b-0"
            >
              <div className="px-[10px] py-[16px] text-[#344054]">{row.index}</div>
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={!row.selectable}
                  aria-label={`Select ${row.assetName}`}
                  onChange={(event) => onToggleRow(row.id, event.target.checked)}
                  className="size-[16px] rounded-[4px] border border-[#d0d5dd] accent-[#101828] disabled:opacity-40"
                />
              </div>
              <div className="truncate px-[8px] py-[16px] text-[14px] text-[#101828]">{row.assetName}</div>
              <div className="px-[8px] py-[16px] text-[#111827]">{formatDisplayDate(row.requestDate)}</div>
              <div className="px-[8px] py-[16px]">
                <span className="inline-flex min-h-[22px] items-center rounded-[999px] border border-[#dcdfe4] bg-[#fcfcfd] px-[8px] text-[12px] text-[#777777]">
                  {row.category}
                </span>
              </div>
              <div className="px-[8px] py-[16px]">
                <ReceiveConditionBadge condition={row.condition} />
              </div>
              <div className="px-[8px] py-[16px] text-center text-[#111827]">{row.quantity}</div>
              <div className="px-[8px] py-[16px] text-center text-[#111827]">{row.received}</div>
              <div className="px-[8px] py-[16px] text-right text-[#111827]">{formatCurrency(row.purchaseCost)}</div>
              <div className="flex items-center justify-center py-[10px]">
                <button
                  type="button"
                  aria-label={`More actions for ${row.assetName}`}
                  className="inline-flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[#667085] transition hover:bg-[#f9fafb]"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M8 3.33331C8.36819 3.33331 8.66667 3.03484 8.66667 2.66665C8.66667 2.29846 8.36819 1.99998 8 1.99998C7.63181 1.99998 7.33334 2.29846 7.33334 2.66665C7.33334 3.03484 7.63181 3.33331 8 3.33331Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 8.66665C8.36819 8.66665 8.66667 8.36817 8.66667 7.99998C8.66667 7.63179 8.36819 7.33331 8 7.33331C7.63181 7.33331 7.33334 7.63179 7.33334 7.99998C7.33334 8.36817 7.63181 8.66665 8 8.66665Z"
                      fill="currentColor"
                    />
                    <path
                      d="M8 14C8.36819 14 8.66667 13.7015 8.66667 13.3333C8.66667 12.9651 8.36819 12.6666 8 12.6666C7.63181 12.6666 7.33334 12.9651 7.33334 13.3333C7.33334 13.7015 7.63181 14 8 14Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
