"use client";

import type { OrderCreateViewProps } from "./OrderCreateView.types";

type OrderCreateSubmitActionProps = Pick<
  OrderCreateViewProps,
  "canSubmitDraft" | "missingSubmitFields" | "onSubmit"
>;

export function OrderCreateSubmitAction({
  canSubmitDraft,
  missingSubmitFields,
  onSubmit,
}: OrderCreateSubmitActionProps) {
  return (
    <div className="flex items-start justify-between gap-[20px] pt-[2px]">
      {missingSubmitFields.length > 0 ? (
        <div className="rounded-[8px] border border-[#e4d0ca] bg-[#fbf4f2] px-[14px] py-[12px] text-[12px] text-[#7a4a40]">
          <p className="font-medium text-[#8f4333]">
            Before you can submit for approval, add:
          </p>
          <ul className="mt-[8px] list-disc pl-[18px]">
            {missingSubmitFields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div />
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmitDraft}
        className="inline-flex h-[41px] cursor-pointer items-center justify-center gap-[10px] rounded-[6px] bg-black px-[24px] text-[15px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit for approval
        <span aria-hidden="true">&gt;</span>
      </button>
    </div>
  );
}
