"use client";

import type { OrderCreateViewProps } from "./OrderCreateView.types";

type OrderCreateSubmitActionProps = Pick<
  OrderCreateViewProps,
  "canSubmitDraft" | "onSubmit"
>;

export function OrderCreateSubmitAction({
  canSubmitDraft,
  onSubmit,
}: OrderCreateSubmitActionProps) {
  return (
    <div className="flex justify-end pt-[2px]">
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmitDraft}
        className="inline-flex h-[41px] items-center justify-center gap-[10px] rounded-[6px] bg-black px-[24px] text-[15px] font-medium text-white disabled:opacity-50"
      >
        Submit for approval
        <span aria-hidden="true">›</span>
      </button>
    </div>
  );
}
