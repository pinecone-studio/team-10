"use client";

import { useState } from "react";

import SearchIcon from "./icons/SearchIcon";
import AllStatusIcon from "./icons/AllStatusicon";
import ChevronDownIcon from "./icons/ChevronDownIcon";

type DistributionSearchFilterProps = {
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  activeTab?: "distributions" | "available-assets" | "employee-requests" | "pending-retrieval";
  onTabChange?: (
    value: "distributions" | "available-assets" | "employee-requests" | "pending-retrieval",
  ) => void;
};
const statuses = [
  "All status",
  "Pending signature",
  "Signed",
  "Expired",
  "Returned",
];

function Check(props: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size ?? 16}
      height={props.size ?? 16}
      viewBox="0 0 24 24"
      fill="none"
      className={props.className}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DistributionSearchFilter({
  value = "",
  placeholder = "Search by distribution number, recipient, or department...",
  onChange,
  activeTab = "distributions",
  onTabChange,
}: DistributionSearchFilterProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = typeof onChange === "function";
  const inputValue = isControlled ? value : internalValue;
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("All status");

  return (
    <div className="flex w-full flex-col items-start gap-[10px] self-stretch">
      <div className="flex w-full flex-col items-start gap-[30px] self-stretch rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-6">
        <div className="flex w-full flex-col items-start rounded-[14px] border border-[#E5E5E5] bg-white px-4 pt-8 pb-10">
          <div className="flex h-9 w-full items-center gap-4 self-stretch">
            <div className="relative flex h-9 flex-1 items-start self-stretch">
              <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
                <SearchIcon />
              </span>
              <input
                type="text"
                value={inputValue}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  if (isControlled) {
                    onChange(nextValue);
                    return;
                  }
                  setInternalValue(nextValue);
                }}
                placeholder={placeholder}
                className="h-9 w-full rounded-[8px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.002)] py-2 pr-3 pl-10 text-[14px] font-normal leading-[18px] text-[#0A0A0A] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#737373]"
              />
            </div>
            <div className="relative w-48">
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="flex h-9 w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#E5E5E5] bg-[rgba(255,255,255,0.002)] px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#F8FAFC] active:scale-[0.99]"
              >
                <span className="flex items-center">
                  <span className="pr-2">
                    <AllStatusIcon />
                  </span>
                  <span className="text-[14px] font-normal leading-5 text-[#0A0A0A]">
                    {selected}
                  </span>
                </span>
                <ChevronDownIcon />
              </button>

              {open && (
                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full rounded-[16px] border border-[#E2E8F0] bg-white p-2 shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setSelected(status);
                        setOpen(false);
                      }}
                      className={`flex w-full cursor-pointer items-center justify-between rounded-[10px] px-3 py-2 text-left text-[14px] leading-5 text-[#0A0A0A] transition-colors ${
                        selected === status
                          ? "bg-[#F1F5F9]"
                          : "hover:bg-[#F8FAFC]"
                      }`}
                    >
                      <span>{status}</span>
                      {selected === status ? (
                        <Check size={16} className="text-[#64748B]" />
                      ) : (
                        <span className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-[30px]">
          <button
            type="button"
            onClick={() => onTabChange?.("distributions")}
            className={`cursor-pointer text-[14px] font-normal leading-5 transition-colors hover:text-[#0A0A0A] ${
              activeTab === "distributions"
                ? "text-[#0A0A0A] underline underline-offset-[3px]"
                : "text-[#64748B]"
            }`}
          >
            Distributions
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.("available-assets")}
            className={`cursor-pointer text-[14px] font-normal leading-5 transition-colors hover:text-[#0A0A0A] ${
              activeTab === "available-assets"
                ? "text-[#0A0A0A] underline underline-offset-[3px]"
                : "text-[#64748B]"
            }`}
          >
            Available Assets
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.("employee-requests")}
            className={`cursor-pointer text-[14px] font-normal leading-5 transition-colors hover:text-[#0A0A0A] ${
              activeTab === "employee-requests"
                ? "text-[#0A0A0A] underline underline-offset-[3px]"
                : "text-[#64748B]"
            }`}
          >
            Employee Requests
          </button>
          <button
            type="button"
            onClick={() => onTabChange?.("pending-retrieval")}
            className={`cursor-pointer text-[14px] font-normal leading-5 transition-colors hover:text-[#0A0A0A] ${
              activeTab === "pending-retrieval"
                ? "text-[#0A0A0A] underline underline-offset-[3px]"
                : "text-[#64748B]"
            }`}
          >
            Pending Retrieval
          </button>
        </div>
      </div>
    </div>
  );
}
