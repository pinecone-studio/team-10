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
      <span className="mb-2 block text-[12px] font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-[14px] text-[#111827] outline-none placeholder:text-[#94a3b8] ${props.className ?? ""}`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-12 w-full rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-sm text-[#62748E] outline-none ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[92px] w-full rounded-[10px] border border-[#d9e0e8] bg-white px-4 py-3 text-sm text-[#111827] outline-none placeholder:text-[#94a3b8] ${props.className ?? ""}`}
    />
  );
}
