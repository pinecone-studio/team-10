"use client";

import type { ReactNode } from "react";

export function ReceivePageFrame(props: {
  title: string;
  subtitle: string;
  fixedViewport?: boolean;
  backLabel?: string;
  onBack?: () => void;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={`${props.fixedViewport ? "flex h-full min-h-0 flex-col overflow-hidden" : "min-h-screen"} bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#ffffff_100%)] pt-[60px]`}
    >
      <div className="flex items-start justify-between gap-4 px-[40px] pb-6">
        <div>
          {props.backLabel && props.onBack ? (
            <button
              type="button"
              onClick={props.onBack}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 text-[14px] font-semibold leading-5 text-[#0f172a] shadow-[rgba(15,23,42,0.04)_0_1px_3px_0] transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(15,23,42,0.14)] hover:text-[#334155] hover:shadow-[rgba(15,23,42,0.10)_0_4px_12px] active:translate-y-0 active:bg-[#f0f4f8] active:text-[#475569] active:shadow-[rgba(15,23,42,0.06)_0_2px_4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
            >
              <span aria-hidden="true">{"<-"}</span>
              <span>{props.backLabel}</span>
            </button>
          ) : null}
          <h1 className="text-[24px] font-bold leading-none text-black">{props.title}</h1>
          <p className="mt-2 text-[14px] leading-5 text-[#64748b]">{props.subtitle}</p>
        </div>
        {props.action}
      </div>
      <div className="border-t border-[#d9e9fb]" />
      {props.children}
    </div>
  );
}
