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
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] py-2 text-[14px] font-medium text-[#1e293b] transition duration-150 hover:bg-[#f8fbff] hover:px-2 active:scale-[0.98] active:bg-[#eef5fd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2"
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
