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
    | "onPermissionMessageChange"
    | "onSubmit"
  >,
) {
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const { subtotal, tax, grandTotal } = createTotalRows(props.draftItems);
  const currencyCode = props.draftItems[0]?.currencyCode ?? "MNT";

  async function handleConfirmSubmit() {
    setSubmitError("");
    setSubmitting(true);

    try {
      await props.onSubmit();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Order ilgeeh ued aldaa garlaa. Dahiad oroldono uu.";
      setSubmitError(message);
      setSubmitting(false);
    }
  }

  return (
    <>
      <aside className="rounded-[12px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]">
        <div className="border-b border-[#e2e8f0] bg-[rgba(241,245,249,0.3)] px-6 py-4">
          <h3 className="text-[16px] font-semibold leading-6 text-[#020618]">
            Order Summary
          </h3>
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
            onClick={() => {
              setSubmitError("");
              setConfirmOpen(true);
            }}
            disabled={!props.canSubmitDraft}
            className="inline-flex h-9 w-full items-center justify-center rounded-[6px] bg-black text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black disabled:active:scale-100"
          >
            Send for Approval
          </button>
        </div>
      </aside>
      {isConfirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f172a]/35 px-4">
          <div className="w-full max-w-[360px] rounded-[16px] border border-[#dbe2ea] bg-white p-5 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <h4 className="text-[18px] font-semibold text-[#111827]">
              Confirm order
            </h4>
            <p className="mt-2 text-[14px] leading-6 text-[#64748b]">
              Are you sure you want to submit this order for approval?
            </p>
            {submitError ? (
              <div className="mt-3 rounded-[10px] border border-[#fecaca] bg-[#fff1f2] px-3 py-2 text-[13px] leading-5 text-[#b91c1c]">
                {submitError}
              </div>
            ) : null}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setSubmitError("");
                  setConfirmOpen(false);
                }}
                disabled={isSubmitting}
                className="inline-flex h-10 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-sm font-medium text-[#111827] transition duration-150 hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleConfirmSubmit();
                }}
                disabled={isSubmitting}
                className="inline-flex h-10 min-w-[104px] items-center justify-center rounded-[10px] bg-[#111827] px-4 text-sm font-medium text-white transition duration-150 hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
