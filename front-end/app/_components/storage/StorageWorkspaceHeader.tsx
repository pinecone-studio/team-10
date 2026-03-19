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
            className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] py-2 text-[14px] font-medium text-[#1e293b] transition duration-150 hover:bg-[#f8fbff] hover:px-2 active:scale-[0.98] active:bg-[#eef5fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
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
