"use client";

import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { ReceiveConditionBadge } from "./ReceiveConditionBadge";
import type { ReceiveRow } from "./receiveTypes";

export function ReceiveTable({
  rows,
  activeRowId,
  onOpenRow,
}: {
  rows: ReceiveRow[];
  activeRowId: string | null;
  onOpenRow: (rowId: string) => void;
}) {
  return (
    <div className="mt-[18px]">
      <div className="overflow-hidden rounded-[12px] border border-[#dcdfe4] bg-white">
        <div className="grid grid-cols-[40px_minmax(220px,1.5fr)_130px_130px_86px_110px_130px] items-center border-b border-[#e6e8ec] bg-[#f8f8f8] text-[14px] font-medium text-[#111827]">
          <div className="px-[10px] py-[10px]">No</div>
          <div className="px-[8px] py-[10px]">Asset Name</div>
          <div className="px-[8px] py-[10px]">Expected Date</div>
          <div className="px-[8px] py-[10px]">Category</div>
          <div className="px-[8px] py-[10px] text-center">Qty</div>
          <div className="px-[8px] py-[10px]">Status</div>
          <div className="px-[8px] py-[10px] text-center">Action</div>
        </div>

        {rows.map((row) => (
          <div
            key={row.id}
            className={`grid grid-cols-[40px_minmax(220px,1.5fr)_130px_130px_86px_110px_130px] items-center border-b border-[#e6e8ec] text-[14px] text-[#111827] last:border-b-0 ${activeRowId === row.id ? "bg-[#f8fbff]" : "bg-white"}`}
          >
            <div className="px-[10px] py-[16px] text-[#344054]">{row.index}</div>
            <div className="px-[8px] py-[16px]">
              <div className="truncate text-[14px] text-[#101828]">{row.assetName}</div>
              <div className="mt-1 text-[11px] text-[#667085]">
                {row.requestNumber} - {row.itemCode} - {formatCurrency(row.purchaseCost, row.currencyCode)}
              </div>
            </div>
            <div className="px-[8px] py-[16px] text-[#111827]">{formatDisplayDate(row.expectedDate)}</div>
            <div className="px-[8px] py-[16px]">
              <span className="inline-flex min-h-[22px] items-center rounded-[999px] border border-[#dcdfe4] bg-[#fcfcfd] px-[8px] text-[12px] text-[#777777]">
                {row.category}
              </span>
            </div>
            <div className="px-[8px] py-[16px] text-center text-[#111827]">{row.quantity}</div>
            <div className="px-[8px] py-[16px]">
              <ReceiveConditionBadge condition={row.condition} />
            </div>
            <div className="flex items-center justify-center px-[8px] py-[10px]">
              <button
                type="button"
                onClick={() => onOpenRow(row.id)}
                className={`inline-flex h-[34px] items-center justify-center rounded-[8px] px-3 text-[12px] font-medium ${row.selectable ? "bg-[#101828] text-white" : "border border-[#d0d5dd] bg-white text-[#98a2b3]"}`}
              >
                {row.selectable ? "Open" : "Stored"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
