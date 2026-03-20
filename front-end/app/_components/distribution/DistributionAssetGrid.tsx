"use client";

import { formatDisplayDate } from "@/app/_lib/order-format";
import type { DistributionItem } from "./hrDistributionHelpers";

export default function DistributionAssetGrid(props: {
  items: DistributionItem[];
  actionLabel?: string;
  actionVariant?: "primary" | "danger";
  onAction?: (item: DistributionItem) => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: (item: DistributionItem) => void;
  showHistorySummary?: boolean;
}) {
  return (
    <section className="w-full">
      <div className="grid gap-4 md:grid-cols-2">
        {props.items.map((item) => (
          <article
            key={`${item.id}-${item.distributionId ?? "storage"}`}
            className="flex min-h-[148px] items-center justify-between justify-self-stretch rounded-[12px] border border-[#D8E8FF] bg-[rgba(255,255,255,0.70)] px-3 py-5"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#f1f5f9]">
                <LaptopIcon />
              </div>
              <div className="flex min-w-0 flex-col justify-between">
                <h3 className="truncate font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#0A1020]">
                  {item.assetName}
                </h3>
                <p className="font-[var(--font-inter)] text-[13px] font-normal leading-5 text-[#64748b]">
                  {item.assetCode}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <Chip>{item.itemType}</Chip>
                  <Chip>{item.storageName}</Chip>
                </div>
                <div className="mt-2 space-y-1 text-[12px] leading-4 text-[#475569]">
                  <p>
                    Holder: {item.holder ? `${item.holder}${item.role ? ` | ${item.role}` : ""}` : "In storage"}
                  </p>
                  {props.showHistorySummary === false ? null : (
                    <p>
                      History: {item.sessions.length} record{item.sessions.length === 1 ? "" : "s"}
                      {item.sessions[0]?.assignedAt
                        ? ` | Last assigned ${formatDisplayDate(item.sessions[0].assignedAt)}`
                        : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-center">
              {props.secondaryActionLabel ? (
                <button
                  type="button"
                  onClick={() => props.onSecondaryAction?.(item)}
                  className="flex h-[36px] min-w-[92px] items-center justify-center rounded-[6px] border border-[#cbd5e1] bg-white px-3 text-[14px] font-medium text-[#0f172a]"
                >
                  {props.secondaryActionLabel}
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => props.onAction?.(item)}
                className={`flex h-[36px] min-w-[92px] items-center justify-center gap-2 rounded-[6px] px-3 text-[14px] font-medium text-white ${
                  props.actionVariant === "danger" ? "bg-[#dc2626]" : "bg-[#0F172A]"
                }`}
              >
                {props.actionLabel ?? "Assign"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Chip(props: { children: React.ReactNode }) {
  return (
    <span className="rounded-[8px] bg-[#eef4ff] px-2.5 py-1 text-[13px] leading-4 text-[#334155]">
      {props.children}
    </span>
  );
}

function LaptopIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M5 7.5C5 6.67157 5.67157 6 6.5 6H17.5C18.3284 6 19 6.67157 19 7.5V15H5V7.5Z" stroke="#475569" strokeWidth="2" />
      <path d="M3.5 17H20.5" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 18H17" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
