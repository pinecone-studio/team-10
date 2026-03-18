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
    | "canSubmitDraft"
    | "missingSubmitFields"
    | "onOrderChange"
    | "onPermissionMessageChange"
    | "onSubmit"
  >,
) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { subtotal, tax, grandTotal } = createTotalRows(props.draftItems);
  const currencyCode = props.draftItems[0]?.currencyCode ?? "MNT";

  return (
    <aside className="rounded-[12px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#e2e8f0] bg-[rgba(241,245,249,0.3)] px-6 py-4">
        <h3 className="text-[16px] font-semibold leading-6 text-[#020618]">Order Summary</h3>
      </div>
      <div className="space-y-5 p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dbeafe] text-[12px] font-semibold text-[#0a0a0a]">
            {(props.draftOrder.requester || "BA").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-medium leading-5 text-[#020618]">
                {props.draftOrder.requester}
              </p>
              <span className="rounded-[6px] bg-[#dbeafe] px-[6px] py-px text-[12px] leading-[15px] text-black">
                {props.draftOrder.department}
              </span>
            </div>
            <p className="text-[12px] leading-4 text-[#62748e]">
              Senior Procurement Specialist
            </p>
          </div>
        </div>
        <div className="space-y-2 border-y border-[#e2e8f0] py-5 text-[14px] text-[#62748e]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-[#020618]">
              {formatCurrency(subtotal, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax (8%)</span>
            <span className="font-medium text-[#020618]">
              {formatCurrency(tax, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-[#e2e8f0] pt-2 text-[14px] font-semibold text-[#020618]">
            <span>Grand Total</span>
            <span className="text-[18px] font-bold leading-7 text-black">
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
            className="min-h-[64px]"
          />
        </Field>
        {!props.canSubmitDraft ? (
          <div className="rounded-[6px] border border-dashed border-[#d9e0e8] px-4 py-3 text-[13px] text-[#94a3b8]">
            Missing: {props.missingSubmitFields.join(", ")}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => setIsConfirmOpen(true)}
          disabled={!props.canSubmitDraft}
          className="inline-flex h-9 w-full items-center justify-center rounded-[6px] bg-black text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black disabled:active:scale-100"
        >
          Send for Approval
        </button>
        {isConfirmOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[320px] rounded-[12px] bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.18)]">
              <h4 className="text-[16px] font-semibold text-[#020618]">
                Are you sure?
              </h4>
              <p className="mt-2 text-[13px] leading-5 text-[#62748e]">
                This order will be sent for approval and you will return to Order History.
              </p>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="inline-flex h-9 items-center justify-center rounded-[6px] border border-[#dbe3ee] px-4 text-[13px] font-medium text-[#0f172a] transition hover:bg-[#f8fafc]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsConfirmOpen(false);
                    await props.onSubmit();
                  }}
                  className="inline-flex h-9 items-center justify-center rounded-[6px] bg-black px-4 text-[13px] font-medium text-white transition hover:bg-[#1f2937]"
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
