"use client";

import type { ReceiveCondition } from "./receiveTypes";

const CONDITION_STYLES: Record<
  ReceiveCondition,
  { label: string; textClassName: string; iconClassName: string }
> = {
  new: {
    label: "New",
    textClassName: "text-[#334155]",
    iconClassName: "text-[#111111]",
  },
  good: {
    label: "Good",
    textClassName: "text-[#6f6f6f]",
    iconClassName: "text-[#84cc16]",
  },
  minorDamage: {
    label: "Partial",
    textClassName: "text-[#6f6f6f]",
    iconClassName: "text-[#f97316]",
  },
  damaged: {
    label: "Damaged",
    textClassName: "text-[#6f6f6f]",
    iconClassName: "text-[#ef4444]",
  },
  defective: {
    label: "Defective",
    textClassName: "text-[#6f6f6f]",
    iconClassName: "text-[#111111]",
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
      className={`inline-flex h-[28px] items-center gap-[6px] rounded-[14px] border border-[#dddddd] bg-white px-[10px] text-[12px] leading-none ${config.textClassName}`}
    >
      <span className={config.iconClassName} aria-hidden="true">
        <ConditionIcon condition={condition} />
      </span>
      <span>{config.label}</span>
    </span>
  );
}

function ConditionIcon({ condition }: { condition: ReceiveCondition }) {
  if (condition === "good") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.4L8.627 4.698L12.267 5.227L9.633 7.793L10.255 11.418L7 9.707L3.745 11.418L4.367 7.793L1.733 5.227L5.373 4.698L7 1.4Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (condition === "minorDamage") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.4L8.627 4.698L12.267 5.227L9.633 7.793L10.255 11.418L7 9.707L3.745 11.418L4.367 7.793L1.733 5.227L5.373 4.698L7 1.4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 12.4V4.9"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M5.2 6.7L7 4.9L8.8 6.7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (condition === "damaged") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M7 1.4L8.627 4.698L12.267 5.227L9.633 7.793L10.255 11.418L7 9.707L3.745 11.418L4.367 7.793L1.733 5.227L5.373 4.698L7 1.4Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4.2 4.2L9.8 9.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M9.8 4.2L4.2 9.8"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (condition === "defective") {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect
          x="1.75"
          y="1.75"
          width="10.5"
          height="10.5"
          rx="1.3"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M5 5L9 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M9 5L5 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path
        d="M7.5 1.3L8.815 5.155L12.7 6.5L8.815 7.845L7.5 11.7L6.185 7.845L2.3 6.5L6.185 5.155L7.5 1.3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11.45 1.55L11.865 2.735L13.05 3.15L11.865 3.565L11.45 4.75L11.035 3.565L9.85 3.15L11.035 2.735L11.45 1.55Z"
        fill="currentColor"
      />
    </svg>
  );
}
