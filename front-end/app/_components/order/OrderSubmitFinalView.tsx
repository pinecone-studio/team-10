"use client";

import { useState } from "react";
import { formatCurrency } from "../../_lib/order-store";
import { useCatalogStore } from "../../_lib/catalog-store";
import type { OrderItem } from "../../_lib/order-types";
import { OrderCatalogProductDialog } from "./OrderCatalogProductDialog";
import { OrderCreateHeader } from "./OrderCreateHeader";
import { OrderFlowProgressSection } from "./OrderCreateProgressSection";
import { OrderDraftSummaryCard } from "./OrderDraftSummaryCard";
import {
  getHigherUpApproverById,
  type DraftOrder,
} from "./orderHelpers";

export function OrderSubmitFinalView({
  draftOrder,
  draftItems,
  summaryTotal,
  selectedApproverId,
  onBack,
  onSubmitOrder,
  onOpenHistory,
  onCatalogProductUpdated,
}: {
  draftOrder: DraftOrder;
  draftItems: OrderItem[];
  summaryTotal: number;
  selectedApproverId: string;
  onBack: () => void;
  onSubmitOrder: () => void;
  onOpenHistory: () => void;
  onCatalogProductUpdated: (productId: string) => void;
}) {
  const catalog = useCatalogStore();
  const selectedApprover = getHigherUpApproverById(selectedApproverId);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const editingProduct =
    catalog.products.find((product) => product.id === editingProductId) ?? null;

  return (
    <>
      <OrderCreateHeader onAction={onOpenHistory} />
      <OrderFlowProgressSection currentStep="submit" />

      <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
        <div className="flex items-center gap-[8px] border-b border-[#d2d2d6] pb-[14px] text-[18px] font-semibold text-[#111111]">
          <span>Submit final order</span>
        </div>

        <div className="mt-[14px]">
          <OrderDraftSummaryCard
            draftOrder={draftOrder}
            draftItems={draftItems}
            summaryTotal={summaryTotal}
            currencyCode={draftItems[0]?.currencyCode ?? "MNT"}
            participantLabel="Approvee"
            participantName={selectedApprover?.fullName ?? "Not selected"}
            onEditProduct={(productId) => {
              const product = catalog.products.find(
                (entry) => entry.id === productId,
              );
              if (!product) return;
              setEditingProductId(product.id);
            }}
          />
        </div>

        <div className="mt-[18px] rounded-[10px] border border-[#e2e5e9] bg-white px-[14px] py-[12px]">
          <p className="text-center text-[13px] font-semibold text-[#171717]">
            List of goods
          </p>
          <div className="mt-[12px] space-y-[8px]">
            {draftItems.map((item, index) => (
              <div
                key={`${item.catalogId}-${index}`}
                className="flex items-center justify-between rounded-[8px] bg-[#f4f6f8] px-[12px] py-[12px]"
              >
                <button
                  type="button"
                  onClick={() => {
                    const product = catalog.products.find(
                      (entry) => entry.id === item.catalogId,
                    );
                    if (!product) return;
                    setEditingProductId(product.id);
                  }}
                  className="cursor-pointer text-left"
                >
                  <p className="text-[14px] font-medium text-[#171717]">
                    {item.name}
                  </p>
                  <p className="mt-[3px] text-[11px] text-[#7f8894]">
                    {item.quantity} pieces x{" "}
                    {formatCurrency(item.unitPrice, item.currencyCode)}
                  </p>
                </button>
                <span className="text-[14px] font-semibold text-[#171717]">
                  {formatCurrency(item.totalPrice, item.currencyCode)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between pt-[6px]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[6px] border border-[#d6d9de] bg-white px-[18px] text-[12px] text-[#1f2937]"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmitOrder}
          className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[6px] bg-[#149b63] px-[20px] text-[13px] font-medium text-white"
        >
          Submit an order
        </button>
      </div>

      <OrderCatalogProductDialog
        isOpen={editingProduct !== null}
        mode="edit"
        categoryId={editingProduct?.categoryId ?? ""}
        productId={editingProduct?.id ?? null}
        onClose={() => setEditingProductId(null)}
        onSelectCatalogProduct={(productId) => {
          onCatalogProductUpdated(productId);
          setEditingProductId(null);
        }}
      />
    </>
  );
}
