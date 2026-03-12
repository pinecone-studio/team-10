"use client";

import type { ChangeEvent, ReactNode } from "react";

export function SectionCard({
  title,
  icon,
  trailing,
  children,
}: {
  title: string;
  icon: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#dbdbdb] bg-white px-[14px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-[#ededed] pb-[14px]">
        <div className="flex items-center gap-[8px] text-[13px] font-semibold text-[#171717]">
          {icon}
          <span>{title}</span>
        </div>
        {trailing}
      </div>
      <div className="pt-[14px]">{children}</div>
    </section>
  );
}

export function InputField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-[6px]">
      <span className="text-[10px] text-[#8e8e8e]">{label}</span>
      {children}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: "text" | "date" | "number";
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      readOnly={disabled || !onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={type === "number" ? 1 : undefined}
      className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px] text-[11px] text-[#4f4f4f] outline-none placeholder:text-[#a0a0a0] disabled:text-[#a0a0a0]"
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="h-[34px] rounded-[6px] border border-[#dfdfdf] bg-[#fbfbfb] px-[10px] text-[11px] text-[#4f4f4f] outline-none"
    >
      {children}
    </select>
  );
}

export function TopBar({
  actionLabel,
  onAction,
}: {
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex h-[32px] w-[130px] items-center gap-[8px] rounded-[6px] border border-[#dddddd] bg-white px-[10px] text-[11px] text-[#9a9a9a]">
        <span>Search</span>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="inline-flex h-[32px] items-center justify-center rounded-[6px] border border-[#d7d7d7] bg-white px-[16px] text-[11px] font-medium text-[#2a2a2a]"
      >
        {actionLabel}
      </button>
    </div>
  );
}
