"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type StorageOption = {
  value: string;
  label: string;
  toneClassName: string;
  menuIconClassName: string;
  icon: React.ReactNode;
};

export const STORAGE_STATUS_OPTIONS: StorageOption[] = [
  {
    value: "available",
    label: "Available",
    toneClassName: "border-[#a7efc9] bg-[#ecfff4] text-[#12a150]",
    menuIconClassName: "text-[#84cc16]",
    icon: <CubeIcon />,
  },
  {
    value: "assigned",
    label: "Assigned",
    toneClassName: "border-[#bfd7ff] bg-[#ebf3ff] text-[#255df0]",
    menuIconClassName: "text-[#255df0]",
    icon: <BriefcaseIcon />,
  },
  {
    value: "inRepair",
    label: "In Repair",
    toneClassName: "border-[#ffd979] bg-[#fff4d2] text-[#c96a00]",
    menuIconClassName: "text-[#f97316]",
    icon: <WrenchIcon />,
  },
  {
    value: "pendingDisposal",
    label: "Pending Disposal",
    toneClassName: "border-[#ffc9ce] bg-[#fff0f1] text-[#d61f26]",
    menuIconClassName: "text-[#dc2626]",
    icon: <TrashIcon />,
  },
  {
    value: "pendingRetrieval",
    label: "Pending Retrieval",
    toneClassName: "border-[#d7e3f4] bg-[#f6f9fd] text-[#52637a]",
    menuIconClassName: "text-[#64748b]",
    icon: <ReturnIcon />,
  },
];

export const STORAGE_CONDITION_OPTIONS: StorageOption[] = [
  {
    value: "good",
    label: "Good",
    toneClassName: "border-[#e5e7eb] bg-white text-[#4b5563]",
    menuIconClassName: "text-[#84cc16]",
    icon: <SparkIcon />,
  },
  {
    value: "damaged",
    label: "Damaged",
    toneClassName: "border-[#e5e7eb] bg-white text-[#6b7280]",
    menuIconClassName: "text-[#fb923c]",
    icon: <DamageIcon />,
  },
  {
    value: "defective",
    label: "Defective",
    toneClassName: "border-[#e5e7eb] bg-white text-[#4b5563]",
    menuIconClassName: "text-[#ef4444]",
    icon: <DefectiveIcon />,
  },
  {
    value: "missing",
    label: "Missing",
    toneClassName: "border-[#e5e7eb] bg-white text-[#4b5563]",
    menuIconClassName: "text-[#64748b]",
    icon: <MissingIcon />,
  },
];

export function StorageStatusBadge({ value }: { value: string }) {
  const option = getStorageOption(STORAGE_STATUS_OPTIONS, value);
  return <StorageBadge option={option} kind="status" />;
}

export function StorageConditionBadge({ value }: { value: string }) {
  const option = getStorageOption(STORAGE_CONDITION_OPTIONS, value);
  return <StorageBadge option={option} kind="condition" />;
}

export function StorageSelectMenu({
  label,
  value,
  options,
  disabled = false,
  onChange,
}: {
  label: string;
  value: string;
  options: StorageOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(() => getStorageOption(options, value), [options, value]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      window.addEventListener("pointerdown", handlePointerDown);
    }

    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <p className="mb-2 text-[12px] font-medium text-[#8fa0ba]">{label}</p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-[16px] border border-[#d8e6f4] bg-white px-3 py-3 text-left shadow-[0_12px_30px_rgba(148,163,184,0.12)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <StorageBadge
          option={selected}
          kind={options === STORAGE_CONDITION_OPTIONS ? "condition" : "status"}
        />
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-[#64748b] transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+10px)] z-20 min-w-full rounded-[16px] border border-[#d7e2ef] bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="space-y-1">
            {options.map((option) => {
              const isSelected = option.value === selected.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-[12px] px-4 py-[11px] text-left transition ${
                    isSelected ? "bg-[#f8fbff]" : "hover:bg-[#f8fbff]"
                  }`}
                >
                  <span className="text-[16px] font-medium text-[#344054]">
                    {option.label}
                  </span>
                  <span className={option.menuIconClassName} aria-hidden="true">
                    {option.icon}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function StorageCheckbox({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) {
  return (
    <label className="ios-checkbox" aria-label={ariaLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="checkbox-wrapper">
        <span className="checkbox-bg" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="checkbox-icon"
          aria-hidden="true"
        >
          <path
            d="M5 12.5L9.2 16.5L19 7.5"
            className="check-path"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </label>
  );
}

export function StorageCategoryBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex h-8 min-w-[124px] items-center justify-center rounded-full border border-[#d7e2ef] bg-[#fbfcfe] px-3 text-[12px] font-medium leading-none text-[#6b7280]">
      <span className="whitespace-nowrap">{label}</span>
    </span>
  );
}

function getStorageOption(options: StorageOption[], value: string) {
  return (
    options.find((option) => option.value === value) ?? {
      value,
      label: humanizeStorageValue(value),
      toneClassName: "border-[#dbe4ee] bg-[#f8fafc] text-[#64748b]",
      menuIconClassName: "text-[#64748b]",
      icon: <CubeIcon />,
    }
  );
}

function humanizeStorageValue(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/^./, (character) => character.toUpperCase());
}

function StorageBadge({
  option,
  kind = "status",
}: {
  option: StorageOption;
  kind?: "status" | "condition";
}) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-[6px] rounded-full border px-3 text-[12px] font-medium leading-none ${
        kind === "condition"
          ? `justify-start text-[#6b7280] ${option.toneClassName}`
          : option.toneClassName
      }`}
    >
      <span
        className={`${kind === "condition" ? option.menuIconClassName : ""} shrink-0`}
        aria-hidden="true"
      >
        {option.icon}
      </span>
      <span className="whitespace-nowrap">{option.label}</span>
    </span>
  );
}

function CubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.8L13 4.55V11.45L8 14.2L3 11.45V4.55L8 1.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M8 1.8V14.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 4.55L8 7.3L13 4.55" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="3" y="4" width="10" height="9" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 4V2.8H10V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M3 8H13" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 9.5H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M9.8 3.1A2.7 2.7 0 0 0 6.4 6.5L2.5 10.4A1.4 1.4 0 1 0 4.5 12.4L8.4 8.5A2.7 2.7 0 0 0 11.8 5.1L9.7 7.2L8.3 5.8L10.4 3.7C10.2 3.45 10.02 3.27 9.8 3.1Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2.8 4H13.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6 2.6H10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.2 4L4.8 12.6C4.86 13.43 5.55 14.08 6.38 14.08H9.62C10.45 14.08 11.14 13.43 11.2 12.6L11.8 4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6.5 6.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.5 6.5V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M6.2 4.2L3.5 6.9L6.2 9.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12.5 11.2V7.8C12.5 7.3 12.1 6.9 11.6 6.9H3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M9.7 11.2H12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.2L9.2 5.2L12.2 6.4L9.2 7.6L8 10.6L6.8 7.6L3.8 6.4L6.8 5.2L8 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

function DamageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2.2L9.2 5.2L12.2 6.4L9.2 7.6L8 10.6L6.8 7.6L3.8 6.4L6.8 5.2L8 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M8 10.8V13.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M6.8 12L8 10.8L9.2 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DefectiveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="5.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.7 5.7L10.3 10.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M10.3 5.7L5.7 10.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function MissingIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 3H7V4.4H4.4V7H3V3Z" fill="currentColor" />
      <path d="M9 3H13V7H11.6V4.4H9V3Z" fill="currentColor" />
      <path d="M3 9H4.4V11.6H7V13H3V9Z" fill="currentColor" />
      <path d="M11.6 9H13V13H9V11.6H11.6V9Z" fill="currentColor" />
      <path d="M4 12L12 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
