"use client";

import { formatCurrency } from "../../_lib/order-store";
import { BrandedQrCode } from "../shared/BrandedQrCode";
import type { ReceiveRow } from "./receiveTypes";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[10px] border border-[#eaecf0] bg-white px-[12px] py-[10px]">
      <p className="text-[11px] text-[#98a2b3]">{label}</p>
      <p className="mt-[4px] text-[14px] font-medium text-[#101828]">{value}</p>
    </div>
  );
}

export function ReceiveDetailPreviewCard(props: {
  activeRow: ReceiveRow;
  activeProductImageUrl?: string | null;
  uploadedImage: string | null;
  completedItemsLabel: string;
  qrValue: string;
  qrTitle: string;
  qrLink: string;
  onOpenQrLink: () => void;
  onCopyQrLink: () => Promise<void>;
  onUploadImage: (file: File) => void;
}) {
  return (
    <div className="self-start rounded-[12px] border border-[#dcdfe4] bg-white p-[18px]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#98a2b3]">Ordered list</p>
      <h2 className="mt-[10px] text-[22px] font-semibold text-[#101828]">{props.activeRow.assetName}</h2>
      <div className="mt-[14px] grid gap-[12px] sm:grid-cols-2">
        <Info label="Order ID" value={props.activeRow.requestNumber} />
        <Info label="Item code" value={props.activeRow.itemCode} />
        <Info label="Expected date" value={props.activeRow.expectedDate} />
        <Info label="Purchase cost" value={formatCurrency(props.activeRow.purchaseCost, props.activeRow.currencyCode)} />
        <Info label="Ordered quantity" value={`${props.activeRow.quantity}`} />
        <Info label="Order progress" value={props.completedItemsLabel} />
      </div>
      <div className="mt-[16px] overflow-hidden rounded-[16px] border border-[#dce6f3] bg-[linear-gradient(180deg,#eff6ff_0%,#dbeafe_100%)]">
        {props.uploadedImage || props.activeProductImageUrl ? (
          <div className="flex min-h-[280px] items-center justify-center bg-[radial-gradient(circle_at_top,#f8fbff_0%,#dbeafe_72%)] p-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={props.uploadedImage || props.activeProductImageUrl || ""} alt={props.activeRow.assetName} className="max-h-[240px] w-full rounded-[14px] object-contain shadow-[0_18px_45px_rgba(59,130,246,0.14)]" />
          </div>
        ) : (
          <div className="flex min-h-[280px] items-center justify-center p-6">
            <div className="rounded-[18px] border border-white/60 bg-white/70 px-6 py-5 text-center shadow-[0_16px_40px_rgba(59,130,246,0.18)]">
              <div className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#60a5fa]">Item Preview</div>
              <div className="mt-3 text-[18px] font-semibold text-[#0f172a]">{props.activeRow.assetName}</div>
              <div className="mt-2 text-[13px] text-[#475569]">{props.activeRow.itemCode}</div>
            </div>
          </div>
        )}
      </div>
      <label className="mt-[12px] flex cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#93c5fd] bg-[#f8fbff] px-4 py-3 text-[13px] font-medium text-[#2563eb]">
        Upload item image
        <input type="file" accept="image/*" className="hidden" onChange={(event) => event.target.files?.[0] && props.onUploadImage(event.target.files[0])} />
      </label>
      <div className="mt-4 rounded-[12px] border border-[#dbe3ee] bg-[#f8fbff] p-4">
        <p className="text-[13px] font-semibold text-[#0f172a]">QR code, serial number, and link</p>
        <div className="mt-3 rounded-[10px] border border-[#dbeafe] bg-white p-3">
          <div className="flex flex-col items-center gap-3">
            <BrandedQrCode value={props.qrValue} title={props.qrTitle} size={132} className="w-full max-w-[210px] shrink-0 p-2 shadow-none" showValue={false} />
            <div className="w-full rounded-[12px] border border-[#e2e8f0] bg-[#f8fbff] px-3 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8fa0ba]">QR Link</p>
                <button type="button" onClick={props.onOpenQrLink} className="text-[11px] font-semibold text-[#2563eb] underline underline-offset-2">Open</button>
              </div>
              <button type="button" onClick={props.onCopyQrLink} className="mt-2 block w-full break-all text-left text-[11px] leading-5 text-[#475569] hover:text-[#2563eb]">
                {props.qrLink || props.qrValue}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
