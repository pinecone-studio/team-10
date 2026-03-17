"use client";

import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] font-semibold leading-4 text-[#020618]">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  const numberInputClassName =
    props.type === "number"
      ? "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      : "";

  return (
    <input
      {...props}
      className={`h-9 w-full rounded-[6px] border border-[#e2e8f0] bg-white px-[13px] text-[14px] text-[#020618] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] ${numberInputClassName} ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-9 w-full rounded-[6px] border border-[#e2e8f0] bg-white px-[13px] text-[14px] text-[#62748e] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[64px] w-full rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-2 text-[14px] text-[#020618] shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none placeholder:text-[#94a3b8] ${props.className ?? ""}`}
    />
  );
}
