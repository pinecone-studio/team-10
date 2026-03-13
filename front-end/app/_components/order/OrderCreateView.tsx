"use client";

import {
  OrderCreateHeader,
} from "./OrderCreateHeader";
import { OrderCreateGoodsSection } from "./OrderCreateGoodsSection";
import { OrderCreateProgressSection } from "./OrderCreateProgressSection";
import { OrderCreateRequestSection } from "./OrderCreateRequestSection";
import { OrderCreateSubmitAction } from "./OrderCreateSubmitAction";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

export function OrderCreateView(props: OrderCreateViewProps) {
  return (
    <>
      <OrderCreateHeader onAction={props.onOpenHistory} />
      <OrderCreateProgressSection />
      <OrderCreateRequestSection
        draftOrder={props.draftOrder}
        onFillDemo={props.onFillDemo}
        onOrderChange={props.onOrderChange}
      />
      <OrderCreateGoodsSection
        goodsDrafts={props.goodsDrafts}
        draftItems={props.draftItems}
        canAddItems={props.canAddItems}
        summaryTotal={props.summaryTotal}
        onSelectCatalogProduct={props.onSelectCatalogProduct}
        onCatalogProductUpdated={props.onCatalogProductUpdated}
        onQuantityChange={props.onQuantityChange}
        onAddItem={props.onAddItem}
        onAddDraftRow={props.onAddDraftRow}
        onRemoveDraftRow={props.onRemoveDraftRow}
        onUpdateItemQuantity={props.onUpdateItemQuantity}
        onRemoveItem={props.onRemoveItem}
      />
      <OrderCreateSubmitAction
        canSubmitDraft={props.canSubmitDraft}
        missingSubmitFields={props.missingSubmitFields}
        onSubmit={props.onSubmit}
      />
    </>
  );
}
