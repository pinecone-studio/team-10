"use client";

import Image from "next/image";
import { useState } from "react";
import { useCatalogStore } from "../../_lib/catalog-store";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import {
  OrderCreateDraftItemsTable,
  OrderCreateEmptyDraftItemsState,
} from "./OrderCreateDraftItems";
import { OrderCatalogProductDialog } from "./OrderCatalogProductDialog";
import { OrderCreateGoodsDraftRow } from "./OrderCreateGoodsDraftRow";

type OrderCreateGoodsSectionProps = Pick<
  OrderCreateViewProps,
  | "goodsDrafts"
  | "draftItems"
  | "canAddItems"
  | "summaryTotal"
  | "onSelectCatalogProduct"
  | "onCatalogProductUpdated"
  | "onQuantityChange"
  | "onAddItem"
  | "onAddDraftRow"
  | "onRemoveDraftRow"
  | "onUpdateItemQuantity"
  | "onRemoveItem"
>;

export function OrderCreateGoodsSection({
  goodsDrafts,
  draftItems,
  canAddItems,
  summaryTotal,
  onSelectCatalogProduct,
  onCatalogProductUpdated,
  onQuantityChange,
  onAddItem,
  onAddDraftRow,
  onRemoveDraftRow,
  onUpdateItemQuantity,
  onRemoveItem,
}: OrderCreateGoodsSectionProps) {
  const catalog = useCatalogStore();
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const editingProduct =
    catalog.products.find((product) => product.id === editingProductId) ?? null;

  function handleEditProduct(productId: string) {
    const product = catalog.products.find((entry) => entry.id === productId);
    if (!product) return;
    setEditingProductId(product.id);
  }

  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
      <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[14px]">
        <h3 className="flex items-center gap-[10px] text-[18px] font-semibold text-[#111111]">
          <Image
            src="/Add good box.svg"
            alt=""
            width={20}
            height={20}
            className="h-[20px] w-[20px]"
          />
          <span>Add goods</span>
        </h3>
        <span className="text-[12px] text-[#8f8f8f]">
          {draftItems.length} item
        </span>
      </div>

      <div className="mt-[14px] rounded-[6px] border border-[#d6d6da] bg-[#dcdde0] px-[10px] py-[10px] text-[12px]">
        <div className="space-y-[10px]">
          {goodsDrafts.map((goodsDraft, index) => (
            <OrderCreateGoodsDraftRow
              key={goodsDraft.id}
              goodsDraft={goodsDraft}
              totalDrafts={goodsDrafts.length}
              isLastRow={index === goodsDrafts.length - 1}
              canAddItem={canAddItems[index]}
              onSelectCatalogProduct={onSelectCatalogProduct}
              onQuantityChange={onQuantityChange}
              onAddItem={onAddItem}
              onAddDraftRow={onAddDraftRow}
              onRemoveDraftRow={onRemoveDraftRow}
            />
          ))}
        </div>
      </div>

      <div className="mt-[20px]">
        {draftItems.length > 0 ? (
          <OrderCreateDraftItemsTable
            draftItems={draftItems}
            summaryTotal={summaryTotal}
            onUpdateItemQuantity={onUpdateItemQuantity}
            onRemoveItem={onRemoveItem}
            onEditProduct={handleEditProduct}
          />
        ) : (
          <OrderCreateEmptyDraftItemsState />
        )}
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
    </section>
  );
}
