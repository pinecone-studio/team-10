"use client";

import type { ReactNode } from "react";

export function WorkspaceShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex-1 rounded-[28px] border border-slate-200/70 bg-[#f6f6f7] px-[26px] py-[24px]">
      <div className="mx-auto flex h-full max-w-[760px] flex-col gap-[16px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[17px] font-semibold text-[#171717]">{title}</h1>
            <p className="mt-[2px] text-[11px] text-[#8c8c8c]">{subtitle}</p>
          </div>
          {actions}
        </div>
        {children}
      </div>
    </div>
  );
}

export function Card({
  title,
  trailing,
  children,
}: {
  title: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[16px] border border-[#dbdbdb] bg-white px-[16px] py-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-[#ededed] pb-[12px]">
        <h2 className="text-[13px] font-semibold text-[#171717]">{title}</h2>
        {trailing}
      </div>
      <div className="pt-[14px]">{children}</div>
    </section>
  );
}

export function ActionButton({
  children,
  variant = "dark",
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  variant?: "dark" | "light" | "green" | "warning";
  onClick?: () => void;
  disabled?: boolean;
}) {
  const className =
    variant === "light"
      ? "border border-[#d7d7d7] bg-white text-[#2a2a2a]"
      : variant === "green"
        ? "bg-[#149b63] text-white"
        : variant === "warning"
          ? "bg-[#ff6b00] text-white"
          : "bg-black text-white";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-[34px] items-center justify-center rounded-[7px] px-[16px] text-[11px] font-medium ${className} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {children}
    </button>
  );
}

export function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-[8px] px-[12px] py-[12px] ${accent ? "bg-[#eef1fa]" : "bg-[#f1f1f2]"}`}>
      <p className="text-[10px] text-[#8a8a8a]">{label}</p>
      <p className="mt-[4px] text-[12px] font-semibold text-[#171717]">{value}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[16px] border border-dashed border-[#d9d9d9] bg-white text-center">
      <p className="text-[14px] font-semibold text-[#171717]">{title}</p>
      <p className="mt-[6px] max-w-[360px] text-[12px] text-[#8b8b8b]">{description}</p>
    </div>
  );
}
