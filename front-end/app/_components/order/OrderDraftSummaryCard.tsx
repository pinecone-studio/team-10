"use client";

import { useEffect, useRef, useState } from "react";
import { formatCurrency } from "../../_lib/order-store";
import type { CurrencyCode, OrderItem } from "../../_lib/order-types";
import type { DraftOrder } from "./orderHelpers";

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`h-[14px] w-[14px] transition-transform ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path
        d="m4 6 4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderDraftSummaryCard({
  draftOrder,
  draftItems,
  summaryTotal,
  currencyCode,
  participantLabel,
  participantName,
  onEditProduct,
}: {
  draftOrder: DraftOrder;
  draftItems: OrderItem[];
  summaryTotal: number;
  currencyCode: CurrencyCode;
  participantLabel?: string;
  participantName?: string;
  onEditProduct: (productId: string) => void;
}) {
  const [isGoodsOpen, setIsGoodsOpen] = useState(false);
  const goodsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isGoodsOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (
        goodsMenuRef.current &&
        !goodsMenuRef.current.contains(event.target as Node)
      ) {
        setIsGoodsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isGoodsOpen]);

  return (
    <div className="rounded-[12px] border border-[#e3e5e8] bg-white px-[14px] py-[14px]">
      <div
        className={`grid gap-[12px] text-[12px] text-[#8a8f98] ${
          participantName ? "md:grid-cols-4" : "md:grid-cols-3"
        }`}
      >
        <div>
          <p>Request number</p>
          <p className="mt-[4px] text-[16px] font-semibold text-[#171717]">
            {draftOrder.requestNumber}
          </p>
        </div>
        <div>
          <p>Requester</p>
          <p className="mt-[4px] text-[16px] font-semibold text-[#171717]">
            {draftOrder.requester || "Requester"}
          </p>
        </div>
        {participantName ? (
          <div>
            <p>{participantLabel ?? "Participant"}</p>
            <p className="mt-[4px] text-[16px] font-semibold text-[#171717]">
              {participantName}
            </p>
          </div>
        ) : null}
        <div className="relative" ref={goodsMenuRef}>
          <p>Total goods</p>
          <button
            type="button"
            onClick={() => {
              if (draftItems.length === 0) return;
              setIsGoodsOpen((current) => !current);
            }}
            className="mt-[4px] inline-flex cursor-pointer items-center gap-[6px] text-[16px] font-semibold text-[#171717]"
          >
            <span>{draftItems.length} type</span>
            <ChevronIcon open={isGoodsOpen} />
          </button>
          {isGoodsOpen ? (
            <div className="absolute right-0 top-full z-20 mt-[8px] w-[240px] rounded-[12px] border border-[#d8dde3] bg-white p-[8px] shadow-[0_18px_40px_rgba(16,24,34,0.16)]">
              {draftItems.map((item, index) => (
                <button
                  key={`${item.catalogId}-${index}`}
                  type="button"
                  onClick={() => {
                    onEditProduct(item.catalogId);
                    setIsGoodsOpen(false);
                  }}
                  className="flex w-full cursor-pointer items-center justify-between rounded-[8px] px-[10px] py-[9px] text-left hover:bg-[#f4f6f8]"
                >
                  <span className="text-[12px] font-medium text-[#1f2937]">
                    {item.name}
                  </span>
                  <span className="text-[11px] text-[#7f8894]">{item.code}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-[14px] rounded-[10px] bg-black px-[18px] py-[16px] text-center text-white">
        <p className="text-[12px] text-white/70">Total amount</p>
        <p className="mt-[2px] text-[28px] font-semibold leading-none">
          {formatCurrency(summaryTotal, currencyCode)}
        </p>
      </div>
    </div>
  );
}
