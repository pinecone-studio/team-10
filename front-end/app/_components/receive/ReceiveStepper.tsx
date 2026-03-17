"use client";

const STEPS = [
  { label: "Order", complete: true },
  { label: "Approval", complete: true },
  { label: "Submit", complete: false },
];

export function ReceiveStepper() {
  return (
    <div className="border-t border-[#e3e4e8] pt-[18px]">
      <div className="mx-auto flex max-w-[420px] items-start justify-between">
        {STEPS.map((step, index) => (
          <div key={step.label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={`flex size-[18px] items-center justify-center rounded-full border-[4px] ${
                  step.complete
                    ? "border-[#dff7e7] bg-black"
                    : "border-[#eef1f5] bg-[#cfd7e4]"
                }`}
              />
              <span
                className={`mt-[8px] text-[13px] font-medium ${
                  step.complete ? "text-[#111111]" : "text-[#b8c0cc]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <div className="mx-[14px] mt-[-18px] h-px flex-1 bg-[#d9dde4]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
