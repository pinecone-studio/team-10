"use client";

import Image from "next/image";
import { formatCurrency } from "../../_lib/order-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { ChevronDownIcon } from "./OrderCreateIcons";
import { Field, Select, TextArea } from "./OrderFormFields";
import { getHigherUpApproverOptions } from "./orderApprovers";
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
  const approvers = getHigherUpApproverOptions(props.draftOrder.department);
  const { subtotal, tax, grandTotal } = createTotalRows(props.draftItems);
  const currencyCode = props.draftItems[0]?.currencyCode ?? "MNT";

  return (
    <aside className="rounded-[20px] border border-[#d9e0e8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-[#e8eef5] px-6 py-6">
        <h3 className="text-[16px] font-semibold text-[#0f172a]">
          Order Summary
        </h3>
      </div>
      <div className="space-y-6 px-6 py-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#dbeafe] text-[12px] font-semibold text-[#0f172a]">
            {(props.draftOrder.requester || "BA").slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-medium text-[#0f172a]">
                {props.draftOrder.requester}
              </p>
              <span className="rounded-full bg-[#eff6ff] px-2 py-0.5 text-[12px] text-[#334155]">
                {props.draftOrder.department}
              </span>
            </div>
            <p className="mt-1 text-[12px] text-[#64748b]">
              Senior Procurement Specialist
            </p>
          </div>
        </div>
        <div className="space-y-3 border-y border-[#e8eef5] py-5 text-[14px] text-[#64748b]">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span className="font-medium text-[#0f172a]">
              {formatCurrency(subtotal, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Tax (8%)</span>
            <span className="font-medium text-[#0f172a]">
              {formatCurrency(tax, currencyCode)}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-[14px] font-semibold text-[#0f172a]">
            <span>Grand Total</span>
            <span className="text-[20px]">
              {formatCurrency(grandTotal, currencyCode)}
            </span>
          </div>
        </div>
        <Field label="Approvers">
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <Image
                src="/order.svg"
                alt=""
                width={16}
                height={16}
                className="h-4 w-4"
              />
            </span>
            <Select
              value={props.draftOrder.requestedApproverId}
              onChange={(event) =>
                props.onOrderChange("requestedApproverId", event.target.value)
              }
              className="appearance-none pl-11 pr-10 text-[10px]"
            >
              <option value="">Add Approver</option>
              {approvers.map((approver) => (
                <option key={approver.id} value={approver.id}>
                  {approver.fullName} - {approver.positionLabel}
                </option>
              ))}
            </Select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </Field>
        <Field label="Notes">
          <TextArea
            value={props.permissionMessage}
            onChange={(event) =>
              props.onPermissionMessageChange(event.target.value)
            }
            placeholder="Add notes for approvers..."
            className="min-h-[72px] text-[14px]"
          />
        </Field>
        {!props.canSubmitDraft ? (
          <div className="rounded-[12px] border border-dashed border-[#d9e0e8] px-4 py-3 text-[13px] text-[#94a3b8]">
            Missing: {props.missingSubmitFields.join(", ")}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => void props.onSubmit()}
          disabled={!props.canSubmitDraft}
          className="inline-flex h-[48px] w-full items-center justify-center rounded-[10px] bg-black text-[14px] font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black disabled:active:scale-100"
        >
          Send for Approval
        </button>
      </div>
    </aside>
  );
}
