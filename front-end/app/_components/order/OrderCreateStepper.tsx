"use client";

import { StepActiveIcon, StepInactiveIcon } from "./OrderCreateIcons";

const steps = ["Create Order", "Approval", "Submit"] as const;

export function OrderCreateStepper() {
  return (
    <div className="border-b border-[#e8eef5] bg-white px-9">
      <div className="mx-auto flex h-[80px] max-w-[980px] items-center">
        {steps.map((step, index) => (
          <div key={step} className="flex min-w-0 flex-1 items-center">
            <div className="flex min-w-[180px] flex-col items-center justify-center">
              {index === 0 ? <StepActiveIcon /> : <StepInactiveIcon />}
              <span
                className={`mt-2 whitespace-nowrap text-[12px] leading-none ${
                  index === 0
                    ? "font-medium text-[#0f172a]"
                    : "font-normal text-[#b8c2d1]"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="mx-10 h-[2px] flex-1 bg-[#e2e8f0]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
