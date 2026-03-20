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
              className="mb-5 inline-flex min-h-[2.75rem] w-auto cursor-pointer items-center justify-center gap-2 rounded-[0.25rem] border border-[rgba(0,0,0,0.1)] bg-white px-5 py-3 text-[15px] font-semibold leading-[1.2] text-[rgba(0,0,0,0.85)] shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all duration-[250ms] select-none hover:-translate-y-px hover:border-[rgba(0,0,0,0.15)] hover:text-[rgba(0,0,0,0.65)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus:border-[rgba(0,0,0,0.15)] focus:text-[rgba(0,0,0,0.65)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 active:translate-y-0 active:border-[rgba(0,0,0,0.15)] active:bg-[#F0F0F1] active:text-[rgba(0,0,0,0.65)] active:shadow-[0_2px_4px_rgba(0,0,0,0.06)]"
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
