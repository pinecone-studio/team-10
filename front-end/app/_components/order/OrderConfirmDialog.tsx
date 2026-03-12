"use client";

import { formatCurrency } from "../../_lib/order-store";
import { ActionButton } from "../shared/WorkspacePrimitives";

export function OrderConfirmDialog(props: {
  isOpen: boolean;
  requestNumber: string;
  itemCount: number;
  totalAmount: number;
  approvalTargetLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-[16px]">
      <div className="w-full max-w-[420px] rounded-[18px] border border-[#d7d7d7] bg-white p-[18px] shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
        <div className="border-b border-[#ececec] pb-[12px]">
          <h3 className="text-[16px] font-semibold text-[#171717]">Confirm order submission</h3>
          <p className="mt-[6px] text-[12px] text-[#7b7b7b]">Are you sure you want to submit this order? Please confirm that the goods list, quantities, and prices are correct before continuing.</p>
        </div>
        <div className="mt-[14px] rounded-[10px] bg-[#f6f6f7] px-[12px] py-[12px] text-[12px] text-[#5e5e5e]">
          <p>Request number: <span className="font-semibold text-[#171717]">{props.requestNumber}</span></p>
          <p className="mt-[4px]">Items: <span className="font-semibold text-[#171717]">{props.itemCount}</span></p>
          <p className="mt-[4px]">Permission request: <span className="font-semibold text-[#171717]">{props.approvalTargetLabel}</span></p>
          <p className="mt-[4px]">Total amount: <span className="font-semibold text-[#171717]">{formatCurrency(props.totalAmount)}</span></p>
        </div>
        <div className="mt-[18px] flex justify-end gap-[10px]"><ActionButton variant="light" onClick={props.onCancel}>Cancel</ActionButton><ActionButton variant="green" onClick={props.onConfirm}>Yes, submit order</ActionButton></div>
      </div>
    </div>
  );
}
