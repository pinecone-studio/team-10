"use client";

import { formatCurrency } from "../../_lib/order-store";
import type { ReceiveRow } from "./receiveTypes";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#eaecf0] bg-white px-[12px] py-[10px]">
      <p className="text-[11px] text-[#98a2b3]">{label}</p>
      <p className="mt-[4px] text-[12px] font-medium text-[#101828]">{value}</p>
    </div>
  );
}

export function ReceiveDetailPreviewCard(props: {
  activeRow: ReceiveRow;
  activeProductImageUrl?: string | null;
  uploadedImage: string | null;
  completedItemsLabel: string;
  onUploadImage: (file: File) => void;
}) {
  return (
    <div className="self-start flex h-[650px] flex-col overflow-hidden rounded-[12px] border border-[#dcdfe4] bg-white p-[18px]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">
        Ordered list
      </p>
      <h2 className="mt-[10px] text-[16px] font-semibold text-[#101828]">
        {props.activeRow.assetName}
      </h2>
      <div className="mt-[12px] min-h-0 flex-1 space-y-[12px] overflow-y-auto pr-1">
        <div className="grid gap-[12px] sm:grid-cols-2">
          <Info label="Order ID" value={props.activeRow.requestNumber} />
          <Info label="Item code" value={props.activeRow.itemCode} />
          <Info label="Expected date" value={props.activeRow.expectedDate} />
          <Info
            label="Purchase cost"
            value={formatCurrency(
              props.activeRow.purchaseCost,
              props.activeRow.currencyCode,
            )}
          />
          <Info label="Ordered quantity" value={`${props.activeRow.quantity}`} />
          <Info label="Order progress" value={props.completedItemsLabel} />
        </div>
        <div className="mt-[16px] overflow-hidden rounded-[16px] border border-[#dce6f3] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
          {props.uploadedImage || props.activeProductImageUrl ? (
            <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#dbeafe_72%)] p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.uploadedImage || props.activeProductImageUrl || ""}
                alt={props.activeRow.assetName}
                className="max-h-[240px] w-full rounded-[14px] object-contain shadow-[0_18px_45px_rgba(59,130,246,0.14)]"
              />
            </div>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center p-6">
              <div className="rounded-[18px] border border-white/60 bg-white/70 px-6 py-5 text-center shadow-[0_16px_40px_rgba(59,130,246,0.18)]">
                <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">
                  Item Preview
                </div>
                <div className="mt-3 text-[16px] font-semibold text-[#0f172a]">
                  {props.activeRow.assetName}
                </div>
                <div className="mt-2 text-[12px] text-[#475569]">
                  {props.activeRow.itemCode}
                </div>
              </div>
            </div>
          )}
        </div>
        <label className="mt-[12px] flex cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#93c5fd] bg-[#f8fbff] px-4 py-3 text-[13px] font-medium text-[#2563eb]">
          Upload item image
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) =>
              event.target.files?.[0] &&
              props.onUploadImage(event.target.files[0])
            }
          />
        </label>
      </div>
    </div>
  );
}
