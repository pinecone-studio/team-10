"use client";

import { useEffect, useRef, useState } from "react";
import {
  RECEIVE_CONDITION_OPTIONS,
  ReceiveConditionIcon,
} from "./ReceiveConditionBadge";
import type { ReceiveStatusFilterValue } from "./receiveTypes";

function ChevronIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" stroke="#475569" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FILTER_OPTIONS: Array<{ value: ReceiveStatusFilterValue; label: string }> = [
  { value: "all", label: "All" },
  ...RECEIVE_CONDITION_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

export function ReceiveStatusFilter(props: {
  value: ReceiveStatusFilterValue;
  onChange: (value: ReceiveStatusFilterValue) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const activeLabel = FILTER_OPTIONS.find((option) => option.value === props.value)?.label ?? "All";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="-ml-[12px] inline-flex w-fit items-center gap-1 rounded-[8px] px-[2px] py-[2px] text-left text-[14px] font-medium text-[#475569] cursor-pointer select-none transition-none hover:!bg-transparent hover:!text-[#475569] hover:!shadow-none hover:!scale-100 active:scale-[0.97] active:bg-[rgba(219,234,254,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfdbfe] focus-visible:ring-offset-2"
      >
        <span>{activeLabel === "All" ? "Status" : activeLabel}</span>
        <ChevronIcon />
      </button>
      {open ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-20 min-w-[160px] rounded-[14px] border border-[#dbeafb] bg-white p-2 shadow-[0_14px_34px_rgba(125,170,232,0.16),0_6px_16px_rgba(15,23,42,0.08)]">
          {FILTER_OPTIONS.map((option) => {
            const isActive = props.value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  props.onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full cursor-pointer items-center gap-[10px] rounded-[10px] px-3 py-2 text-left text-[13px] ${isActive ? "bg-[#eef6ff] text-[#2563eb]" : "text-[#475569]"}`}
              >
                <span className="inline-flex w-[10px] items-center justify-center text-[#84cc16]">
                  {option.value === "all" ? <span className="h-[6px] w-[6px] rounded-full bg-[#94a3b8]" /> : <ReceiveConditionIcon condition={option.value} />}
                </span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
