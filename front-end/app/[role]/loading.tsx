"use client";

import { useSearchParams } from "next/navigation";
import { FrontendLoading } from "../_components/shared/FrontendLoading";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const activeIndex =
    section === "receive"
      ? 2
      : section === "storage"
        ? 3
        : section === "distribution"
          ? 4
          : section === "terminate"
            ? 5
            : 1;
  const variant =
    section === "receive"
      ? "receive"
      : section === "storage"
        ? "storage-list"
        : section === "distribution"
          ? "distribution"
          : section === "terminate"
            ? "terminate"
            : "order-history";
  const title =
    section === "receive"
      ? "Loading receive workspace"
      : section === "storage"
        ? "Loading storage workspace"
        : section === "distribution"
          ? "Loading distribution workspace"
          : section === "terminate"
            ? "Loading termination workspace"
            : "Loading order history";
  const description =
    section === "receive"
      ? "Preparing receive summary cards, search, and intake rows."
      : section === "storage"
        ? "Preparing storage metrics, filters, and asset rows."
        : section === "distribution"
          ? "Preparing assignment queues, filters, and recipient details."
          : section === "terminate"
            ? "Preparing offboarding details and assigned asset review."
            : "Preparing filters, summaries, and the latest order rows.";

  return (
    <main className="h-screen overflow-hidden bg-[#efefef] text-slate-900">
      <section className="flex h-full items-stretch overflow-hidden">
        <aside className="flex h-full w-full max-w-[275px] shrink-0 self-stretch overflow-hidden border-r border-white/10 bg-[#050810] px-3 py-[40px] text-white backdrop-blur-[12px]">
          <div className="flex h-full w-full min-w-0 flex-col px-0">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-[60px]">
              <div className="flex min-w-0 items-center gap-3 px-3">
                <div className="space-y-2">
                  <Skeleton className="h-10 w-16 bg-[#173056]" />
                  <Skeleton className="h-3 w-40 bg-[#101c31]" />
                  <Skeleton className="h-2 w-32 bg-[#0b1424]" />
                </div>
              </div>
              <div className="min-h-0 min-w-0 flex-1 px-3">
                <div className="flex min-w-0 flex-col gap-2">
                  {["HOME", "ORDER", "RECEIVE", "STORAGE", "DISTRIBUTION", "TERMINATE"].map(
                    (label, index) => (
                    <div
                      key={label}
                      className={`flex min-h-[42px] items-center gap-3 rounded-[8px] px-3 py-2 ${index === activeIndex ? "bg-[linear-gradient(90deg,#223450_0%,#081327_100%)]" : ""}`}
                    >
                      <Skeleton className="h-[21px] w-[21px] rounded-md bg-[#1f334d]" />
                      <Skeleton
                        className={`h-5 rounded-full ${index === activeIndex ? "bg-[#28517f]" : "bg-[#111c2f]"} ${
                          label === "DISTRIBUTION" ? "w-28" : label === "TERMINATE" ? "w-20" : "w-24"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-5 min-w-0 border-t border-[#2E333D] px-3 pt-[17px]">
              <div className="rounded-[14px] bg-[#151b26] p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-full bg-[#243246]" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-28 rounded-full bg-[#243246]" />
                    <Skeleton className="h-3 w-20 rounded-full bg-[#1a2535]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1 overflow-y-auto bg-[#f8fafc] p-0">
          <FrontendLoading
            variant={variant}
            className="min-h-full rounded-none border-0 bg-transparent px-0 py-0"
            title={title}
            description={description}
          />
        </div>
      </section>
    </main>
  );
}
