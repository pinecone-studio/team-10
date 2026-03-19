"use client";

import { formatCurrency, formatDisplayDate } from "../../_lib/order-store";
import { ReceiveConditionBadge } from "./ReceiveConditionBadge";
import { ReceiveStatusFilter } from "./ReceiveStatusFilter";
import type { ReceiveRow, ReceiveStatusFilterValue } from "./receiveTypes";

const GRID_CLASS =
  "grid grid-cols-[24px_280px_160px_100px_110px_100px_120px_100px]";

function SortIcon({ direction }: { direction: "asc" | "desc" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className="h-[14px] w-[14px]"
    >
      {direction === "desc" ? (
        <>
          <path
            d="M4 2.5V11.5"
            stroke="#475569"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M1.75 9.25L4 11.5L6.25 9.25"
            stroke="#475569"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <path
            d="M10 11.5V2.5"
            stroke="#475569"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.75 4.75L10 2.5L12.25 4.75"
            stroke="#475569"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
    </svg>
  );
}

export function ReceiveTable({
  rows,
  activeRowId,
  onOpenRow,
  expectedDateSortDirection,
  onToggleExpectedDateSort,
  statusFilter,
  onStatusFilterChange,
}: {
  rows: ReceiveRow[];
  activeRowId: string | null;
  onOpenRow: (rowId: string) => void;
  expectedDateSortDirection: "asc" | "desc";
  onToggleExpectedDateSort: () => void;
  statusFilter: ReceiveStatusFilterValue;
  onStatusFilterChange: (value: ReceiveStatusFilterValue) => void;
}) {
  const hasRows = rows.length > 0;

  return (
    <section className="mx-auto mt-[18px] flex h-[756px] w-full max-w-[1081px] min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#e2efff] bg-white p-5 shadow-[0_14px_34px_rgba(125,170,232,0.12),0_6px_16px_rgba(15,23,42,0.05)]">
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="flex h-full w-full min-h-0 min-w-0 flex-col">
          <div
            className={`${GRID_CLASS} items-center rounded-[14px] border border-[#e3efff] bg-[#eef6ff] px-4 py-4 text-[14px] font-medium text-[#475569]`}
          >
            <div className="pr-[6px]">No</div>
            <div className="px-[6px]">Asset Name</div>
            <button
              type="button"
              onClick={onToggleExpectedDateSort}
              className="-ml-[12px] inline-flex w-fit items-center gap-1 rounded-[8px] px-[2px] py-[2px] text-left text-[14px] font-medium text-[#475569] cursor-pointer select-none transition-none hover:!bg-transparent hover:!text-[#475569] hover:!shadow-none hover:!scale-100 active:scale-[0.97] active:bg-[rgba(219,234,254,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfdbfe] focus-visible:ring-offset-2"
            >
              <span>Expected Date</span>
              <SortIcon direction={expectedDateSortDirection} />
            </button>
            <div className="px-[6px]">
              <ReceiveStatusFilter
                value={statusFilter}
                onChange={onStatusFilterChange}
              />
            </div>
            <div className="px-[6px] text-center">Qty</div>
            <div className="px-[4px] text-center">Received</div>
            <div className="px-[6px]">Purchase Cost</div>
            <div className="px-[6px] text-center">Action</div>
          </div>
          <div
            className={`mt-5 min-h-0 ${hasRows ? "flex-1 overflow-y-auto overflow-x-auto pr-1" : ""}`}
          >
            {hasRows ? (
              rows.map((row) => (
                <div
                  key={row.id}
                  className={`${GRID_CLASS} items-center border-b border-[#e3e4e8] bg-white px-4 py-3 text-[14px] text-[#111827] last:border-b-0 ${
                    activeRowId === row.id ? "bg-[#f8fbff]" : "bg-white"
                  }`}
                >
                  <div className="pr-[6px] text-[#344054]">{row.index}</div>
                  <div className="px-[6px]">
                    <div className="truncate text-[13px] font-medium text-[#475569]">
                      {row.assetName}
                    </div>
                    <div className="mt-0.5 text-[12px] text-[#94a3b8]">
                      {row.requestNumber} - {row.itemCode}
                    </div>
                  </div>
                  <div className="px-[4px] text-[12px] text-[#475569]">
                    {formatDisplayDate(row.expectedDate)}
                  </div>
                  <div className="px-[6px]">
                    <ReceiveConditionBadge condition={row.condition} />
                  </div>
                  <div className="px-[6px] text-center text-[13px] text-[#475569]">
                    {row.quantity}
                  </div>
                  <div className="px-[4px] text-center text-[13px] text-[#475569]">
                    {row.received}
                  </div>
                  <div className="px-[6px] text-[13px] text-[#475569]">
                    {formatCurrency(row.purchaseCost, row.currencyCode)}
                  </div>
                  <div className="flex items-center justify-center px-[4px]">
                    <button
                      type="button"
                      onClick={() => row.selectable && onOpenRow(row.id)}
                      className={`inline-flex h-[30px] min-w-[70px] items-center justify-center rounded-[9px] px-2 text-[10px] font-medium ${
                        row.selectable
                          ? "bg-[#101828] text-white"
                          : "border border-[#d0d5dd] bg-white text-[#98a2b3]"
                      }`}
                    >
                      {row.selectable ? "Open" : "Received"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-[240px] items-center justify-center rounded-[14px] border border-[#dbeafb] bg-[rgba(255,255,255,0.72)] px-6 py-28 text-center text-[14px] text-[#94a3b8]">
                No approved orders ready for receive.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
