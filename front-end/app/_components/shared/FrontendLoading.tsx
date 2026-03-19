"use client";

import { Skeleton } from "@/components/ui/skeleton";

type FrontendLoadingProps = {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
  variant?:
    | "workspace"
    | "storage-list"
    | "asset-detail"
    | "order-history"
    | "receive"
    | "distribution"
    | "terminate";
};

export function FrontendLoading({
  title = "Loading",
  description = "Please wait while we prepare the latest data.",
  className = "",
  compact = false,
  variant = "workspace",
}: FrontendLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-[22px] border border-dashed border-[#d9e9f9] bg-white/80 px-6 py-10 text-center ${compact ? "min-h-[360px]" : "min-h-[420px]"} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-full max-w-[1180px] space-y-6">
        {variant === "asset-detail" ? <AssetDetailSkeleton /> : null}
        {variant === "storage-list" ? <StorageListSkeleton /> : null}
        {variant === "order-history" ? <OrderHistorySkeleton /> : null}
        {variant === "receive" ? <ReceiveSkeleton /> : null}
        {variant === "distribution" ? <DistributionSkeleton /> : null}
        {variant === "terminate" ? <TerminateSkeleton /> : null}
        {variant === "workspace" ? <WorkspaceSkeleton /> : null}
        <div className="space-y-2">
          <p className="text-[18px] font-semibold text-[#0f172a]">{title}</p>
          <p className="mt-2 max-w-[360px] text-[13px] text-[#64748b]">{description}</p>
        </div>
      </div>
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="rounded-[24px] border border-[#e2ebf4] bg-[linear-gradient(180deg,#f8fbff_0%,#eef5fb_100%)] p-5 shadow-[0_18px_36px_rgba(148,163,184,0.1)]">
      <div className="grid gap-3 sm:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-28 rounded-full" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-4 w-5/6 rounded-full" />
          <Skeleton className="h-4 w-3/4 rounded-full" />
        </div>
        <div className="grid gap-3">
          <Skeleton className="h-[88px] w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-14 rounded-xl" />
            <Skeleton className="h-14 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StorageListSkeleton() {
  return (
    <div className="space-y-5 text-left">
      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr_0.85fr]">
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
        <Skeleton className="h-28 rounded-[24px]" />
      </div>
      <div className="rounded-[24px] border border-[#e2ebf4] bg-white p-5 shadow-[0_18px_36px_rgba(148,163,184,0.1)]">
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-11 w-[280px] rounded-2xl" />
          <Skeleton className="h-11 w-36 rounded-2xl" />
          <Skeleton className="h-11 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-40 rounded-2xl" />
        </div>
        <div className="mt-5 overflow-hidden rounded-[20px] border border-[#e6edf5]">
          <div className="grid grid-cols-[44px_1.2fr_1fr_1fr_1fr_0.9fr_0.7fr] gap-3 border-b border-[#eef4f8] bg-[#f8fbff] px-4 py-4">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="h-4 rounded-full" />
            ))}
          </div>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-[44px_1.2fr_1fr_1fr_1fr_0.9fr_0.7fr] gap-3 border-b border-[#eef4f8] px-4 py-4 last:border-b-0"
            >
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-5 rounded-full" />
              <Skeleton className="h-5 rounded-full" />
              <Skeleton className="h-5 rounded-full" />
              <Skeleton className="h-5 rounded-full" />
              <Skeleton className="h-8 rounded-full" />
              <Skeleton className="h-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AssetDetailSkeleton() {
  return (
    <div className="grid gap-5 text-left xl:grid-cols-[minmax(0,1.3fr)_420px]">
      <section className="overflow-hidden rounded-[24px] border border-[#d7e4f2] bg-white shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
        <div className="border-b border-[#e6edf5] bg-[linear-gradient(180deg,#eaf3ff_0%,#f7fbff_100%)] px-6 py-6">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="mt-3 h-9 w-2/3 rounded-xl" />
          <Skeleton className="mt-3 h-4 w-full rounded-full" />
          <Skeleton className="mt-2 h-4 w-5/6 rounded-full" />
          <div className="mt-4 flex gap-3">
            <Skeleton className="h-8 w-28 rounded-full" />
            <Skeleton className="h-8 w-32 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div
              key={index}
              className={`rounded-[20px] border border-[#eef4f8] bg-[#fbfdff] p-4 ${index === 11 ? "md:col-span-2" : ""}`}
            >
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="mt-3 h-6 w-4/5 rounded-full" />
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-5">
        <div className="rounded-[24px] border border-[#d7e4f2] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <div className="grid gap-4">
            <Skeleton className="h-16 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
          </div>
          <Skeleton className="mt-4 h-4 w-full rounded-full" />
        </div>
        <div className="rounded-[24px] border border-[#d7e4f2] bg-white p-5 shadow-[0_20px_48px_rgba(148,163,184,0.16)]">
          <div className="flex items-center justify-between gap-3">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-xl" />
          </div>
          <div className="mt-5 flex justify-center">
            <Skeleton className="h-[220px] w-[220px] rounded-[24px]" />
          </div>
          <Skeleton className="mx-auto mt-4 h-4 w-2/3 rounded-full" />
        </div>
      </section>
    </div>
  );
}

function OrderHistorySkeleton() {
  return (
    <div className="space-y-0 overflow-hidden rounded-[24px] border border-[#e2e8f0] bg-white text-left shadow-[0_18px_36px_rgba(148,163,184,0.1)]">
      <div className="flex items-end justify-between gap-4 px-[24px] pb-4 pt-[60px] lg:pl-[44px] lg:pr-[60px]">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-56 rounded-xl" />
            <Skeleton className="h-9 w-24 rounded-full" />
          </div>
          <Skeleton className="h-5 w-80 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-44 rounded-[6px]" />
          <Skeleton className="h-10 w-10 rounded-[6px]" />
        </div>
      </div>
      <div className="flex flex-col gap-4 border-y border-[#e2e8f0] px-6 py-[25px] xl:flex-row xl:items-center xl:justify-between">
        <div className="flex w-fit flex-wrap items-center gap-2 rounded-[8px] bg-[#f1f5f9] p-1">
          <Skeleton className="h-10 w-24 rounded-[4px]" />
          <Skeleton className="h-10 w-28 rounded-[4px]" />
          <Skeleton className="h-10 w-32 rounded-[4px]" />
          <Skeleton className="h-10 w-28 rounded-[4px]" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Skeleton className="h-9 w-[207px] rounded-[6px]" />
          <Skeleton className="h-9 w-[170px] rounded-[6px]" />
        </div>
      </div>
      <div className="px-[24px] pb-[40px] pt-6 lg:px-[44px]">
        <section className="rounded-[12px] border border-[#e2e8f0] bg-white px-4 py-6">
          <div className="overflow-x-auto">
            <div className="min-w-[920px]">
              <div className="grid grid-cols-[100px_1.35fr_1.2fr_120px_130px_120px_130px] items-center rounded-[6px] border border-[#e3e4e8] bg-[#f1f5f9] px-6 py-6">
                {Array.from({ length: 7 }, (_, index) => (
                  <Skeleton key={index} className="h-5 rounded-full" />
                ))}
              </div>
              <div className="mt-5 space-y-[10px]">
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-[100px_1.35fr_1.2fr_120px_130px_120px_130px] items-center rounded-[6px] border border-[#e3e4e8] bg-white px-6 py-4"
                  >
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-4/5 rounded-full" />
                    <div className="flex items-center gap-[6px]">
                      <Skeleton className="h-5 w-5 rounded-full" />
                      <Skeleton className="h-5 w-28 rounded-full" />
                    </div>
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-8 w-32 rounded-full" />
                    <div className="flex justify-center">
                      <Skeleton className="h-10 w-24 rounded-[10px]" />
                    </div>
                    <Skeleton className="ml-auto h-5 w-24 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ReceiveSkeleton() {
  return (
    <div className="space-y-[18px] text-left">
      <div className="space-y-3">
        <Skeleton className="h-[48px] w-[180px] rounded-xl" />
        <Skeleton className="h-[20px] w-[360px] rounded-full" />
      </div>
      <div className="grid gap-[14px] md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="rounded-[12px] border border-[#dce6f3] bg-[linear-gradient(180deg,#f8fbff_0%,#eef6ff_100%)] px-[16px] py-[14px] shadow-[0_10px_24px_rgba(148,163,184,0.12)]"
          >
            <Skeleton className="h-[14px] w-[70px] rounded-full bg-[#d7e7fb]" />
            <Skeleton className="mt-[10px] h-[34px] w-3/4 rounded-xl bg-[#bfdbfe]" />
          </div>
        ))}
      </div>
      <div className="mt-[18px] flex items-center justify-between gap-[16px]">
        <div className="flex h-[36px] w-full max-w-[232px] items-center overflow-hidden rounded-[8px] border border-[#d0d5dd] bg-white">
          <Skeleton className="h-full flex-1 rounded-none" />
          <Skeleton className="h-full w-[36px] rounded-none border-l border-[#eaecf0]" />
        </div>
        <Skeleton className="h-[32px] w-[140px] rounded-[10px]" />
      </div>
      <div className="mt-[18px] overflow-hidden rounded-[12px] border border-[#dcdfe4] bg-white">
        <div className="grid grid-cols-[40px_minmax(220px,1.4fr)_132px_130px_110px_92px_92px_130px_120px] items-center border-b border-[#e6e8ec] bg-[#f8f8f8] px-[8px] py-[10px]">
          {Array.from({ length: 9 }, (_, index) => (
            <Skeleton key={index} className="h-[18px] rounded-full" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[40px_minmax(220px,1.4fr)_132px_130px_110px_92px_92px_130px_120px] items-center border-b border-[#e6e8ec] px-[8px] py-[10px] last:border-b-0"
          >
            <Skeleton className="h-[24px] w-[18px] rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-[20px] w-[180px] rounded-full" />
              <Skeleton className="h-[14px] w-[220px] rounded-full" />
            </div>
            <Skeleton className="h-[20px] w-[90px] rounded-full" />
            <Skeleton className="h-[22px] w-[90px] rounded-full" />
            <Skeleton className="h-[22px] w-[72px] rounded-full" />
            <Skeleton className="mx-auto h-[20px] w-[20px] rounded-full" />
            <Skeleton className="mx-auto h-[20px] w-[20px] rounded-full" />
            <Skeleton className="h-[20px] w-[76px] rounded-full" />
            <div className="flex justify-end">
              <Skeleton className="h-[34px] w-[76px] rounded-[8px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionSkeleton() {
  return (
    <div className="space-y-6 text-left">
      <div className="overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_18px_36px_rgba(148,163,184,0.1)]">
        <div className="flex flex-col gap-4 px-6 pb-2 pt-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-5 w-72 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-40 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
        </div>
        <div className="px-6 pb-6">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-5">
            <div className="flex flex-col gap-4 lg:flex-row">
              <Skeleton className="h-9 flex-1 rounded-[8px]" />
              <Skeleton className="h-9 w-full rounded-[8px] lg:w-48" />
            </div>
            <div className="mt-4 flex flex-wrap gap-6 border-t border-[#E2E8F0] pt-4">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-full" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_36px_rgba(148,163,184,0.08)]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <div className="mt-5 space-y-[8px]">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-11 rounded-[10px]" />
            ))}
          </div>
        </div>
        <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_36px_rgba(148,163,184,0.08)]">
          <Skeleton className="h-6 w-28 rounded-full" />
          <div className="mt-5 grid grid-cols-4 gap-[12px]">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="h-20 rounded-[14px]" />
            ))}
          </div>
          <div className="mt-[14px] grid grid-cols-2 gap-[12px]">
            <Skeleton className="h-16 rounded-[12px]" />
            <Skeleton className="h-16 rounded-[12px]" />
          </div>
          <Skeleton className="mt-[14px] h-40 rounded-[12px]" />
          <div className="mt-[16px] flex justify-end">
            <Skeleton className="h-10 w-28 rounded-[10px]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminateSkeleton() {
  return (
    <div className="space-y-6 text-left">
      <div className="space-y-3">
        <Skeleton className="h-11 w-56 rounded-xl" />
        <Skeleton className="h-5 w-[540px] rounded-full" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_36px_rgba(148,163,184,0.08)]">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-36 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
          <div className="mt-4 space-y-4">
            <Skeleton className="h-[42px] rounded-[10px]" />
            <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <Skeleton className="h-6 w-40 rounded-full" />
              <Skeleton className="mt-2 h-4 w-32 rounded-full" />
              <div className="mt-4 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded-full" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
              </div>
            </div>
            <Skeleton className="h-10 w-full rounded-[10px]" />
          </div>
        </div>
        <div className="rounded-[18px] border border-[#e5e7eb] bg-white p-5 shadow-[0_18px_36px_rgba(148,163,184,0.08)]">
          <Skeleton className="h-6 w-32 rounded-full" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-[14px] border border-[#e5e7eb] bg-[#fcfcfd] px-4 py-4 md:grid-cols-[1.3fr_0.7fr_0.7fr_auto]"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="h-4 w-20 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
                <div className="flex items-center md:justify-end">
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
