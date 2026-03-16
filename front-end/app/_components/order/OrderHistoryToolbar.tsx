"use client";

import { OrderHistoryDateRangePicker } from "./OrderHistoryDateRangePicker";
import { OrderNotificationButton } from "./OrderNotificationButton";

const filterOptions = ["all", "pending", "completed", "cancelled"] as const;
function SearchIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      className="h-[15px] w-[15px]"
    >
      <path
        d="M13.8333 15L8.58333 9.75C8.16667 10.0833 7.6875 10.3472 7.14583 10.5417C6.60417 10.7361 6.02778 10.8333 5.41667 10.8333C3.90278 10.8333 2.62153 10.309 1.57292 9.26042C0.524306 8.21181 0 6.93056 0 5.41667C0 3.90278 0.524306 2.62153 1.57292 1.57292C2.62153 0.524306 3.90278 0 5.41667 0C6.93056 0 8.21181 0.524306 9.26042 1.57292C10.309 2.62153 10.8333 3.90278 10.8333 5.41667C10.8333 6.02778 10.7361 6.60417 10.5417 7.14583C10.3472 7.6875 10.0833 8.16667 9.75 8.58333L15 13.8333L13.8333 15ZM5.41667 9.16667C6.45833 9.16667 7.34375 8.80208 8.07292 8.07292C8.80208 7.34375 9.16667 6.45833 9.16667 5.41667C9.16667 4.375 8.80208 3.48958 8.07292 2.76042C7.34375 2.03125 6.45833 1.66667 5.41667 1.66667C4.375 1.66667 3.48958 2.03125 2.76042 2.76042C2.03125 3.48958 1.66667 4.375 1.66667 5.41667C1.66667 6.45833 2.03125 7.34375 2.76042 8.07292C3.48958 8.80208 4.375 9.16667 5.41667 9.16667Z"
        fill="black"
      />
    </svg>
  );
}

export function OrderHistoryToolbar(props: {
  counts: Record<(typeof filterOptions)[number], number>;
  selectedFilter: (typeof filterOptions)[number];
  searchQuery: string;
  startDate: string;
  endDate: string;
  onFilterChange: (value: (typeof filterOptions)[number]) => void;
  onSearchChange: (value: string) => void;
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onOpenCreate: () => void;
  onOpenDetail: (orderId: string) => void;
}) {
  return (
    <>
      <div className="flex items-start justify-between gap-4 border-b border-[#d9e0e8] bg-white px-9 py-10">
        <div>
          <h2 className="text-[24px] font-semibold leading-none text-[#111827]">
            Order history
          </h2>
          <p className="mt-3 text-[14px] text-[#94a3b8]">
            View and manage all inventory order requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={props.onOpenCreate}
            className="inline-flex h-12 cursor-pointer items-center justify-center rounded-[10px] bg-[#111827] px-5 text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            Create new order
          </button>
          <OrderNotificationButton onOpenDetail={props.onOpenDetail} />
        </div>
      </div>
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit flex-wrap items-center gap-2 rounded-[12px] bg-[#f1f5f9] p-1">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => props.onFilterChange(filter)}
              className={`inline-flex cursor-pointer items-center gap-2 rounded-[10px] px-4 py-2 text-sm transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 ${props.selectedFilter === filter ? "bg-white font-medium text-[#111827] shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-white active:bg-[#f8fafc]" : "text-[#64748b] hover:bg-white/70 active:bg-white"}`}
            >
              <span>{filter[0]!.toUpperCase() + filter.slice(1)}</span>
              <span className="text-xs text-[#94a3b8]">
                {props.counts[filter]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 w-full items-center gap-2 rounded-[10px] border border-[#d9e0e8] bg-white px-4 sm:w-[270px]">
            <span>
              <SearchIcon />
            </span>
            <input
              value={props.searchQuery}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder="Search orders..."
              className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#94a3b8]"
            />
          </label>
          <OrderHistoryDateRangePicker
            startDate={props.startDate}
            endDate={props.endDate}
            onChange={props.onDateRangeChange}
          />
        </div>
      </div>
    </>
  );
}
