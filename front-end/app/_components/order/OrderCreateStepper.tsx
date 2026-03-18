"use client";

import { StepActiveIcon, StepInactiveIcon } from "./OrderCreateIcons";

const steps = ["Create Order"] as const;

export function OrderCreateStepper() {
  return (
    <div className="border-b border-[#e8eef5] bg-white px-4 sm:px-6 lg:px-9">
      <div className="mx-auto flex h-[80px] w-full max-w-[980px] items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-2 text-center">
              {index === 0 ? <StepActiveIcon /> : <StepInactiveIcon />}
              <span
                className={`mt-2 text-[12px] leading-none ${
                  index === 0
                    ? "font-medium text-[#0f172a]"
                    : "font-normal text-[#b8c2d1]"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="mx-3 h-[2px] min-w-[24px] flex-1 bg-[#e2e8f0] sm:mx-6 lg:mx-10" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
