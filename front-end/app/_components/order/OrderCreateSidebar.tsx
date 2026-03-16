"use client";

import { formatCurrency } from "../../_lib/order-store";
import { getHigherUpApproverOptions } from "./orderApprovers";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { Field, Select, TextArea } from "./OrderFormFields";

export function OrderCreateSidebar(props: Pick<OrderCreateViewProps, "draftOrder" | "draftItems" | "summaryTotal" | "permissionMessage" | "canSubmitDraft" | "missingSubmitFields" | "onOrderChange" | "onPermissionMessageChange" | "onSubmit">) {
  const approvers = getHigherUpApproverOptions(props.draftOrder.department);
  const subtotal = props.draftItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * 0.08);
  const grandTotal = subtotal + tax;
  const currencyCode = props.draftItems[0]?.currencyCode ?? "MNT";

  return (
    <aside className="space-y-6 rounded-[18px] border border-[#d9e0e8] bg-white p-5">
      <h3 className="text-[28px] font-semibold leading-none text-[#111827]">Order Summary</h3>
      <div className="rounded-[14px] bg-[#f8fafc] p-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#dbeafe] text-sm font-semibold text-[#2563eb]">{(props.draftOrder.requester || "BA").slice(0, 2).toUpperCase()}</span>
          <div><p className="text-sm font-medium text-[#111827]">{props.draftOrder.requester || "Requester name"}</p><p className="text-sm text-[#94a3b8]">{props.draftOrder.department}</p></div>
        </div>
      </div>
      <div className="space-y-3 border-y border-[#eef2f6] py-5 text-sm text-[#64748b]">
        <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-[#111827]">{formatCurrency(subtotal, currencyCode)}</span></div>
        <div className="flex items-center justify-between"><span>Tax (8%)</span><span className="font-medium text-[#111827]">{formatCurrency(tax, currencyCode)}</span></div>
        <div className="flex items-center justify-between text-base font-semibold text-[#111827]"><span>Grand Total</span><span>{formatCurrency(props.draftItems.length > 0 ? grandTotal : props.summaryTotal, currencyCode)}</span></div>
      </div>
      <Field label="Approvers">
        <Select value={props.draftOrder.requestedApproverId} onChange={(event) => props.onOrderChange("requestedApproverId", event.target.value)}>
          <option value="">Add Approver</option>
          {approvers.map((approver) => <option key={approver.id} value={approver.id}>{approver.fullName} - {approver.positionLabel}</option>)}
        </Select>
      </Field>
      <Field label="Notes">
        <TextArea value={props.permissionMessage} onChange={(event) => props.onPermissionMessageChange(event.target.value)} placeholder="Add notes for approvers..." />
      </Field>
      {!props.canSubmitDraft ? <div className="rounded-[12px] border border-dashed border-[#d9e0e8] px-4 py-3 text-sm text-[#94a3b8]">Missing: {props.missingSubmitFields.join(", ")}</div> : null}
      <button type="button" onClick={() => void props.onSubmit()} disabled={!props.canSubmitDraft} className="inline-flex h-12 w-full items-center justify-center rounded-[10px] bg-[#111827] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40">Send for Approval</button>
    </aside>
  );
}
