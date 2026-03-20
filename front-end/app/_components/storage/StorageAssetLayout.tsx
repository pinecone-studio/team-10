"use client";

import type { ReactNode } from "react";

export function StorageActionBar({ children }: { children: ReactNode }) {
  return (
    <div className="-mt-7 flex flex-wrap items-center justify-end gap-2.5">
      {children}
    </div>
  );
}

export function StorageFilterCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#e6eef8] bg-white p-5 shadow-[0_10px_28px_rgba(148,163,184,0.10)]">
      {children}
    </section>
  );
}

export function StorageStatsBar({ children }: { children: ReactNode }) {
  return <div className="text-[12px] text-[#6b7280]">{children}</div>;
}

export function StorageTableCard({ children }: { children: ReactNode }) {
  return (
    <section className="rounded-[24px] border border-[#e6eef8] bg-white p-4 shadow-[0_12px_30px_rgba(148,163,184,0.12)]">
      {children}
    </section>
  );
}
