"use client";

type FrontendLoadingProps = {
  title?: string;
  description?: string;
  className?: string;
  compact?: boolean;
};

export function FrontendLoading({
  title = "Loading",
  description = "Please wait while we prepare the latest data.",
  className = "",
  compact = false,
}: FrontendLoadingProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-[22px] border border-dashed border-[#d9e9f9] bg-white/80 px-6 py-10 text-center ${compact ? "min-h-[360px]" : "min-h-[420px]"} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-6">
        <div className="inventory-loader" aria-hidden="true">
          <div className="inventory-loader-ground">
            <div />
          </div>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className={`inventory-loader-box inventory-loader-box${index}`}>
              <div />
            </div>
          ))}
        </div>
        <div>
          <p className="text-[18px] font-semibold text-[#0f172a]">{title}</p>
          <p className="mt-2 max-w-[360px] text-[13px] text-[#64748b]">{description}</p>
        </div>
      </div>
    </div>
  );
}
