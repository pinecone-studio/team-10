"use client";

import type { ReactNode } from "react";

export function StorageWorkspaceHeader(props: {
  title: string;
  subtitle: string;
  backLabel?: string;
  onBack?: () => void;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-[44px] pb-6 pt-[60px]">
      <div>
        {props.backLabel && props.onBack ? (
          <button
            type="button"
            onClick={props.onBack}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[rgba(15,23,42,0.08)] bg-white px-4 py-3 text-[14px] font-semibold leading-5 text-[#0f172a] shadow-[rgba(15,23,42,0.04)_0_1px_3px_0] transition-all duration-200 hover:-translate-y-[1px] hover:border-[rgba(15,23,42,0.14)] hover:text-[#334155] hover:shadow-[rgba(15,23,42,0.10)_0_4px_12px] active:translate-y-0 active:bg-[#f0f4f8] active:text-[#475569] active:shadow-[rgba(15,23,42,0.06)_0_2px_4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
          >
            <span aria-hidden="true" className="text-[16px] leading-none">
              {"<-"}
            </span>
            <span>{props.backLabel}</span>
          </button>
        ) : null}
        <h1 className={`${props.backLabel ? "mt-3" : ""} text-[24px] font-semibold leading-none text-[#111111]`}>
          {props.title}
        </h1>
        {props.subtitle ? (
          <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
            {props.subtitle}
          </p>
        ) : null}
      </div>
      {props.action}
    </div>
  );
}
