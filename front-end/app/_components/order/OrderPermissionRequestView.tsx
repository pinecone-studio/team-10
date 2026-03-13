"use client";

import { useState } from "react";
import { useCatalogStore } from "../../_lib/catalog-store";
import type { OrderItem } from "../../_lib/order-types";
import { SelectInput } from "./OrderPrimitives";
import { OrderCatalogProductDialog } from "./OrderCatalogProductDialog";
import { OrderCreateHeader } from "./OrderCreateHeader";
import { OrderFlowProgressSection } from "./OrderCreateProgressSection";
import { OrderDraftSummaryCard } from "./OrderDraftSummaryCard";
import {
  getHigherUpApproverById,
  getHigherUpApproverOptions,
  type DraftOrder,
} from "./orderHelpers";

export function OrderPermissionRequestView({
  draftOrder,
  draftItems,
  summaryTotal,
  permissionMessage,
  selectedApproverId,
  canRequestApproval,
  onPermissionMessageChange,
  onApproverChange,
  onBack,
  onRequestApproval,
  onOpenHistory,
  onCatalogProductUpdated,
}: {
  draftOrder: DraftOrder;
  draftItems: OrderItem[];
  summaryTotal: number;
  permissionMessage: string;
  selectedApproverId: string;
  canRequestApproval: boolean;
  onPermissionMessageChange: (value: string) => void;
  onApproverChange: (approverId: string) => void;
  onBack: () => void;
  onRequestApproval: () => void;
  onOpenHistory: () => void;
  onCatalogProductUpdated: (productId: string) => void;
}) {
  const catalog = useCatalogStore();
  const approverOptions = getHigherUpApproverOptions(draftOrder.department);
  const selectedApprover = getHigherUpApproverById(selectedApproverId);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const editingProduct =
    catalog.products.find((product) => product.id === editingProductId) ?? null;

  return (
    <>
      <OrderCreateHeader onAction={onOpenHistory} />
      <OrderFlowProgressSection currentStep="permission" />

      <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
        <div className="flex items-center gap-[8px] border-b border-[#d2d2d6] pb-[14px] text-[18px] font-semibold text-[#111111]">
          <span>Permission request</span>
        </div>

        <div className="mt-[14px] grid gap-[12px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[10px] border border-[#dfdfdf] bg-white px-[16px] py-[16px]">
            <p className="text-[13px] font-semibold text-[#171717]">Approvee</p>
            <div className="mt-[14px]">
              <label className="flex flex-col gap-[6px]">
                <span className="text-[12px] text-[#7f8894]">
                  Select a higher-up approver
                </span>
                <SelectInput
                  value={selectedApproverId}
                  onChange={(event) => onApproverChange(event.target.value)}
                >
                  <option value="">Choose approvee</option>
                  {approverOptions.map((approver) => (
                    <option key={approver.id} value={approver.id}>
                      {`${approver.fullName} - ${approver.positionLabel}`}
                    </option>
                  ))}
                </SelectInput>
              </label>
            </div>

            {selectedApprover ? (
              <div className="mt-[16px] flex items-center gap-[12px] rounded-[10px] border border-[#edf0f3] bg-[#f7f9fb] px-[14px] py-[14px]">
                <div className="flex h-[40px] w-[40px] items-center justify-center rounded-full bg-black text-[12px] font-semibold text-white">
                  {selectedApprover.initials}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-[#171717]">
                    {selectedApprover.fullName}
                  </p>
                  <p className="text-[12px] text-[#7f8894]">
                    {selectedApprover.positionLabel}
                  </p>
                  <p className="mt-[4px] text-[12px] text-[#7f8894]">
                    {selectedApprover.departmentLabel}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-[16px] rounded-[10px] border border-dashed border-[#d7dde5] bg-[#f7f9fb] px-[14px] py-[16px] text-[12px] text-[#7f8894]">
                Choose an approver from the higher-up positions before continuing.
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-[#dfdfdf] bg-white px-[16px] py-[16px]">
            <p className="text-[13px] font-semibold text-[#171717]">
              Explanation message
            </p>
            <textarea
              value={permissionMessage}
              onChange={(event) => onPermissionMessageChange(event.target.value)}
              placeholder="Write a comment to send with the approval request ..."
              className="mt-[14px] min-h-[88px] w-full rounded-[8px] border border-[#d8d8dc] bg-[#f7f8fa] px-[12px] py-[10px] text-[12px] text-[#4f5660] outline-none placeholder:text-[#a0a0a0]"
            />
          </div>
        </div>

        <div className="mt-[16px]">
          <OrderDraftSummaryCard
            draftOrder={draftOrder}
            draftItems={draftItems}
            summaryTotal={summaryTotal}
            currencyCode={draftItems[0]?.currencyCode ?? "MNT"}
            onEditProduct={(productId) => {
              const product = catalog.products.find(
                (entry) => entry.id === productId,
              );
              if (!product) return;
              setEditingProductId(product.id);
            }}
          />
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
        <div className="flex flex-col items-end gap-[8px]">
          {!canRequestApproval ? (
            <p className="text-[12px] text-[#8f4333]">
              Select an approvee to continue.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onRequestApproval}
            disabled={!canRequestApproval}
            className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[6px] bg-[#111827] px-[20px] text-[13px] font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Request Approval
          </button>
        </div>
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
