"use client";

import { StepActiveIcon } from "./OrderCreateIcons";

export function OrderCreateStepper() {
  return (
    <div className="border-b border-[#e8eef5] bg-white px-9">
      <div className="mx-auto flex h-[80px] max-w-[980px] items-center justify-center">
        <div className="flex min-w-[180px] flex-col items-center justify-center">
          <StepActiveIcon />
          <span className="mt-2 whitespace-nowrap text-[12px] font-medium leading-none text-[#0f172a]">
            Create Order
          </span>
        </div>
      </div>
    </div>
  );
}
