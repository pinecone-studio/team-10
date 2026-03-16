"use client";

const steps = ["Create Order", "Approval", "Submit"];

export function OrderCreateStepper() {
  return (
    <div className="border-b border-[#d9e0e8] bg-white px-9 py-6">
      <div className="mx-auto flex max-w-[520px] items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={`inline-flex h-4 w-4 rounded-full border-2 ${
                  index === 0
                    ? "border-[#111827] bg-[#86efac]"
                    : "border-[#cbd5e1] bg-[#e2e8f0]"
                }`}
              />
              <span
                className={`mt-2 text-xs ${
                  index === 0 ? "font-medium text-[#111827]" : "text-[#94a3b8]"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 ? (
              <span className="mx-6 h-px flex-1 bg-[#e2e8f0]" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
