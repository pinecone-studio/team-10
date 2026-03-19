"use client";

import type { ReactNode } from "react";

export function ReceivePageFrame(props: {
  title: string;
  subtitle: string;
  fixedViewport?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`${props.fixedViewport ? "flex h-full min-h-0 flex-col overflow-hidden" : "min-h-screen"} bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#ffffff_100%)] pt-[60px]`}
    >
      <div className="flex items-start justify-between gap-4 px-[40px] pb-6">
        <div>
          <h1 className="text-[24px] font-bold leading-none text-black">{props.title}</h1>
          <p className="mt-2 text-[14px] leading-5 text-[#64748b]">{props.subtitle}</p>
        </div>
      </div>
      <div className="border-t border-[#d9e9fb]" />
      {props.children}
    </div>
  );
}
