"use client";

const STEPS = [
  { label: "Order", complete: true },
  { label: "Approval", complete: true },
  { label: "Submit", complete: false },
];

export function ReceiveStepper() {
  return (
    <div className="rounded-[12px] border border-[#eaecf0] bg-white px-[24px] py-[20px]">
      <div className="mx-auto flex max-w-[420px] items-start justify-between">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-[12px] items-center justify-center rounded-full border-[3px] ${
                  step.complete
                    ? "border-[#dff7e7] bg-[#101828]"
                    : "border-[#eef2f6] bg-[#cfd7e4]"
                }`}
              />
              <span
                className={`mt-[8px] text-[14px] font-medium ${
                  step.complete ? "text-[#101828]" : "text-[#cbd5e1]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div className="mx-[14px] mt-[-18px] h-px flex-1 bg-[#eaecf0]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
