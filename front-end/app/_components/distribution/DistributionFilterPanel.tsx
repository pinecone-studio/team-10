"use client";

import { useState } from "react";

export type DistributionTab = "distributions" | "available-assets" | "employee-requests" | "pending-retrieval";
export type DistributionStatusFilter =
  | "All status"
  | "Pending signature"
  | "Signed"
  | "Returned"
  | "Pending Retrieval";

const tabs = [
  ["distributions", "Distributions", 4, "min-w-[150px]"],
  ["available-assets", "Available assets", 6, "min-w-[185px]"],
  ["employee-requests", "Employee requests", 3, "min-w-[180px]"],
  ["pending-retrieval", "Pending retrieval", 3, "min-w-[170px]"],
] as const satisfies ReadonlyArray<readonly [DistributionTab, string, number, string]>;

const statuses: DistributionStatusFilter[] = [
  "All status",
  "Pending signature",
  "Signed",
  "Returned",
  "Pending Retrieval",
];

export default function DistributionFilterPanel(props: {
  activeTab: DistributionTab;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onTabChange: (value: DistributionTab) => void;
  selectedStatus: DistributionStatusFilter;
  onStatusChange: (value: DistributionStatusFilter) => void;
  counts: Record<DistributionTab, number>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="w-full rounded-[24px] border border-[#d9e7f7] bg-[rgba(255,255,255,0.62)] p-5 shadow-[0_18px_40px_rgba(191,219,254,0.22)]">
      <div className="flex self-stretch rounded-[14px] border border-[#D8E8FF] bg-white px-4 pt-8 pb-10">
        <div className="flex w-full flex-col items-start gap-4 lg:flex-row">
          <label className="relative flex h-[36px] flex-1 items-center rounded-[12px] border border-[#d7e4f2] bg-white px-4 shadow-[0_4px_16px_rgba(148,163,184,0.08)]">
            <SearchIcon />
            <input
              value={props.searchValue}
              onChange={(event) => props.onSearchChange(event.target.value)}
              placeholder="Search by distribution number, recipient, or department..."
              className="w-full bg-transparent pl-8 text-[14px] text-[#0f172a] outline-none placeholder:text-[#7b8ca4]"
            />
          </label>
          <div className="relative w-[192px]">
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="flex h-[36px] w-[192px] items-center justify-between rounded-[12px] border border-[#d7e4f2] bg-white px-3 py-2 shadow-[0_4px_16px_rgba(148,163,184,0.08)]"
            >
              <span className="flex w-full items-center justify-between text-[14px] text-[#111827]">
                <span className="flex items-center gap-3">
                  <FilterIcon />
                  <span>{props.selectedStatus}</span>
                </span>
                <ChevronDown />
              </span>
            </button>
            {open ? (
              <div className="absolute top-[calc(100%+4px)] z-20 flex w-[192px] flex-col items-start gap-[6px] rounded-[8px] border border-[#E2E8F0] bg-white p-[6px] shadow-[0_12px_28px_rgba(148,163,184,0.18)]">
                <div className="flex w-full flex-col gap-[6px]">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        props.onStatusChange(status);
                        setOpen(false);
                      }}
                      className={`flex h-[44px] items-center justify-between rounded-[8px] px-4 text-left text-[14px] text-[#111827] ${props.selectedStatus === status ? "bg-[#edf3fb]" : "bg-transparent"}`}
                    >
                      <span>{status}</span>
                      {props.selectedStatus === status ? <CheckIcon /> : <span className="h-5 w-5" />}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4 inline-flex max-w-[740px] rounded-[8px] border border-[rgba(255,255,255,0.20)] bg-[rgba(216,232,255,0.60)] p-1 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]">
        {tabs.map(([value, label, , widthClassName]) => (
          <button
            key={value}
            type="button"
            onClick={() => props.onTabChange(value)}
            className={`flex h-[28px] items-center justify-center gap-[10px] rounded-[4px] px-4 text-[14px] whitespace-nowrap ${widthClassName} ${
              props.activeTab === value ? "bg-white text-[#111827] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05),0_4px_6px_-4px_rgba(0,0,0,0.05)]" : "text-[#64748b]"
            }`}
          >
            <span>{label}</span>
            <span className={`inline-flex h-[15px] min-w-[15px] items-center justify-center rounded-[4px] px-[2px] text-[12px] font-normal leading-none ${
              props.activeTab === value ? "bg-[#93c5fd] text-white" : "bg-[#bcd2fb] text-[#5080C8]"
            }`}>
              {props.counts[value]}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute left-[12px] top-[13px] h-4 w-4 text-[#64748b]" aria-hidden="true">
      <path d="M7.33335 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33335C12.6667 4.38783 10.2789 2 7.33335 2C4.38783 2 2 4.38783 2 7.33335C2 10.2789 4.38783 12.6667 7.33335 12.6667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 14L11.1 11.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M16.6673 4.16667H3.33398L8.66732 10.4733V14.1667L11.334 15.8333V10.4733L16.6673 4.16667Z" stroke="#6B7280" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 7.5L10 12.5L15 7.5" stroke="#9CA3AF" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M4.16602 10.4167L8.33268 14.1667L15.8327 5.83334" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
