"use client";

import type { DistributionItem } from "./hrDistributionHelpers";

export default function DistributionAssetGrid(props: {
  items: DistributionItem[];
  actionLabel?: string;
  onAction?: (item: DistributionItem) => void;
}) {
  return (
    <section className="w-full">
      <div className="grid gap-4 md:grid-cols-2">
        {props.items.map((item) => (
          <article key={`${item.id}-${item.distributionId ?? "storage"}`} className="flex h-[121px] items-center justify-between justify-self-stretch rounded-[12px] border border-[#D8E8FF] bg-[rgba(255,255,255,0.70)] px-3 py-6">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[#f1f5f9]">
                <LaptopIcon />
              </div>
              <div className="flex h-[70px] min-w-0 flex-col justify-between">
                <h3 className="truncate font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#0A1020]">{item.assetName}</h3>
                <p className="font-[var(--font-inter)] text-[13px] font-normal leading-5 text-[#64748b]">{item.assetCode}</p>
                <div className="flex flex-wrap gap-2.5">
                  <Chip>{item.itemType}</Chip>
                  <Chip>{item.storageName}</Chip>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => props.onAction?.(item)}
              className="flex h-[36px] w-[72px] shrink-0 items-center justify-center gap-2 self-center rounded-[6px] bg-[#0F172A] text-[15px] font-medium text-white"
            >
              {props.actionLabel ?? "Assign"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function Chip(props: { children: React.ReactNode }) {
  return <span className="rounded-[8px] bg-[#eef4ff] px-2.5 py-1 text-[13px] leading-4 text-[#334155]">{props.children}</span>;
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
