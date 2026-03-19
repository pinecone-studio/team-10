"use client";

import type { ReceiveCondition } from "./receiveTypes";

const CONDITION_STYLES: Record<
  ReceiveCondition,
  { label: string; textClassName: string; iconClassName: string }
> = {
  good: {
    label: "Good",
    textClassName: "text-[#667085]",
    iconClassName: "text-[#84cc16]",
  },
  damaged: {
    label: "Damaged",
    textClassName: "text-[#667085]",
    iconClassName: "text-[#f97316]",
  },
  defective: {
    label: "Defective",
    textClassName: "text-[#667085]",
    iconClassName: "text-[#ef4444]",
  },
  missing: {
    label: "Missing",
    textClassName: "text-[#667085]",
    iconClassName: "text-[#64748b]",
  },
};

export const RECEIVE_CONDITION_OPTIONS = (
  Object.keys(CONDITION_STYLES) as ReceiveCondition[]
).map((condition) => ({
  value: condition,
  ...CONDITION_STYLES[condition],
}));

export function ReceiveConditionBadge({ condition }: { condition: ReceiveCondition }) {
  const config = CONDITION_STYLES[condition];

  return (
    <span
      className={`inline-flex h-[22px] items-center gap-[4px] rounded-[999px] border border-[#d0d5dd] bg-white px-[8px] text-[12px] leading-none ${config.textClassName}`}
    >
      <span className={config.iconClassName} aria-hidden="true">
        <ReceiveConditionIcon condition={condition} />
      </span>
      <span>{config.label}</span>
    </span>
  );
}

export function ReceiveConditionIcon({ condition }: { condition: ReceiveCondition }) {
  if (condition === "good") {
    return (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.4L8.627 4.698L12.267 5.227L9.633 7.793L10.255 11.418L7 9.707L3.745 11.418L4.367 7.793L1.733 5.227L5.373 4.698L7 1.4Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (condition === "damaged") {
    return (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.4L8.627 4.698L12.267 5.227L9.633 7.793L10.255 11.418L7 9.707L3.745 11.418L4.367 7.793L1.733 5.227L5.373 4.698L7 1.4Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 11.6V6.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M5.5 7.4L7 5.9L8.5 7.4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (condition === "defective") {
    return (
      <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
        <path
          d="M5.2 5.2L8.8 8.8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8.8 5.2L5.2 8.8"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M7 1.6L12.2 10.8C12.3668 11.0951 12.3664 11.457 12.1988 11.7518C12.0312 12.0466 11.7177 12.2289 11.3783 12.2292H2.62167C2.28227 12.2289 1.96878 12.0466 1.80118 11.7518C1.63358 11.457 1.63318 11.0951 1.8 10.8L7 1.6Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7 5.2V7.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M7 10.05H7.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
