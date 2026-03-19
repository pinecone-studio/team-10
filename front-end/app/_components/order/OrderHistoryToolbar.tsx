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
      <div className="flex items-end justify-between gap-4 px-[44px] pb-4 pt-[60px]">
        <div>
          <h2 className="text-[24px] font-bold leading-none text-black">Order history</h2>
          <p className="mt-1 text-[14px] leading-5 text-[#64748b]">
            View and manage all inventory order requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={props.onOpenCreate}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-[6px] bg-[#0f172a] px-4 text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            Create new order
          </button>
          <OrderNotificationButton onOpenDetail={props.onOpenDetail} />
        </div>
      </div>
      <div className="flex flex-col gap-4 border-y border-[#d9e9fb] bg-transparent px-[44px] py-[22px] xl:flex-row xl:items-center xl:justify-between">
        <div className="inline-flex w-fit flex-wrap items-center rounded-[12px] border border-[#e2efff] bg-[rgba(255,255,255,0.72)] p-1.5 shadow-[0_10px_30px_rgba(125,170,232,0.14),0_2px_8px_rgba(15,23,42,0.04)] backdrop-blur-[10px]">
          {filterOptions.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => props.onFilterChange(filter)}
              className={`inline-flex cursor-pointer items-center gap-[8px] rounded-[10px] px-4 py-2 text-[14px] transition duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 ${props.selectedFilter === filter ? "bg-white font-medium text-[#111827] shadow-[0_4px_14px_rgba(125,170,232,0.18)] hover:bg-white active:bg-[#f8fafc]" : "text-[#64748b] hover:bg-white/70 active:bg-white"}`}
            >
              <span>{filter[0]!.toUpperCase() + filter.slice(1)}</span>
              <span className={`rounded-full px-1.5 text-[11px] ${props.selectedFilter === filter ? "bg-[#eff6ff] text-[#4f82db]" : "bg-[#edf2f7] text-[#64748b]"}`}>
                {props.counts[filter]}
              </span>
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <label className="flex h-10 w-full items-center gap-[6px] rounded-[10px] border border-[#e2efff] bg-[rgba(255,255,255,0.84)] px-3 shadow-[0_8px_18px_rgba(15,23,42,0.04)] sm:w-[207px]">
            <span>
              <SearchIcon />
            </span>
            <input
              value={props.searchQuery}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder="Search orders..."
              className="w-full bg-transparent text-[14px] text-black outline-none placeholder:text-[rgba(0,0,0,0.5)]"
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
