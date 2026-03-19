"use client";

import { useState } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { Field, TextArea } from "./OrderFormFields";
import { createTotalRows } from "./orderCreateUtils";

export function OrderCreateSummarySidebar(
  props: Pick<
    OrderCreateViewProps,
    | "draftOrder"
    | "draftItems"
    | "permissionMessage"
    | "submitError"
    | "canSubmitDraft"
    | "missingSubmitFields"
    | "onFillDemo"
    | "onOrderChange"
    | "onPermissionMessageChange"
    | "onSubmit"
  >,
) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { subtotal, tax, grandTotal } = createTotalRows(props.draftItems);
  const currencyCode = props.draftItems[0]?.currencyCode ?? "USD";

  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-[22px] border border-[#dbeafb] bg-white shadow-[0_14px_40px_rgba(125,170,232,0.18),0_8px_18px_rgba(15,23,42,0.08)] xl:h-[650px]">
      <div className="px-8 py-6">
        <h3 className="text-[16px] font-semibold leading-7 text-[#111827]">
          Order Summary
        </h3>
      </div>
      <div className="flex flex-1 flex-col gap-5 border-t border-[#dbeafb] px-6 pb-8 pt-8">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#dbeafe] text-[13px] font-semibold text-[#0a0a0a]">
            {(props.draftOrder.requester || "BA").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold leading-5 text-[#020618]">
                {props.draftOrder.requester}
              </p>
              <span className="rounded-[8px] bg-[#eef4ff] px-2 py-1 text-[12px] leading-none text-[#475569]">
                {props.draftOrder.department}
              </span>
            </div>
            <p className="text-[12px] leading-4 text-[#62748e]">
              Senior Procurement Specialist
            </p>
          </div>
        </div>
        <div className="space-y-3 border-y border-[#dbeafb] py-6 text-[14px] text-[#62748e]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="text-[14px] font-semibold text-[#020618]">
              {formatCurrency(subtotal, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax (8%)</span>
            <span className="text-[14px] font-semibold text-[#020618]">
              {formatCurrency(tax, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#dbeafb] pt-3 text-[14px] font-semibold text-[#020618]">
            <span>Grand Total</span>
            <span className="text-[22px] font-bold leading-7 text-black">
              {formatCurrency(grandTotal, currencyCode)}
            </span>
          </div>
        </div>
        <Field label="Notes">
          <TextArea
            value={props.permissionMessage}
            onChange={(event) =>
              props.onPermissionMessageChange(event.target.value)
            }
            placeholder="Add notes for approvers..."
            className="min-h-[78px] rounded-[10px] border-[#d7e7fb] px-4 py-3"
          />
        </Field>
        {!props.canSubmitDraft ? (
          <div className="rounded-[10px] border border-dashed border-[#d9e0e8] px-4 py-3 text-[13px] text-[#94a3b8]">
            Missing: {props.missingSubmitFields.join(", ")}
          </div>
        ) : null}
        {props.submitError ? (
          <div className="rounded-[10px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#b42318]">
            {props.submitError}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!props.canSubmitDraft}
          className="mt-auto inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#5d88ce] text-[14px] font-medium text-white transition duration-150 hover:bg-[#4c78c1] active:scale-[0.98] active:bg-[#436cae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfdbfe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-white disabled:opacity-100"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="m17 3-8.6 8.6M17 3l-5.5 14-3.1-5.4L3 8.5 17 3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Send for Approval
        </button>
        {isConfirmOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[320px] rounded-[12px] bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
              <h4 className="text-[16px] font-semibold text-[#020618]">
                Are you sure?
              </h4>
              <p className="mt-2 text-[13px] leading-5 text-[#62748e]">
                This order will be sent for approval and you will return to
                Order History.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[6px] border border-[#dbe3ee] px-4 text-[13px] font-medium text-[#0f172a] transition hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsConfirmOpen(false);
                    await props.onSubmit();
                  }}
                  className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[6px] bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#1f2937]"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
