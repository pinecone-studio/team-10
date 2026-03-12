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
      <OrderCreateHeader />
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
        onSelectSuggestion={props.onSelectSuggestion}
        onQuantityChange={props.onQuantityChange}
        onUnitPriceChange={props.onUnitPriceChange}
        onAddItem={props.onAddItem}
        onAddDraftRow={props.onAddDraftRow}
        onRemoveDraftRow={props.onRemoveDraftRow}
        onRemoveItem={props.onRemoveItem}
      />
      <OrderCreateSubmitAction
        canSubmitDraft={props.canSubmitDraft}
        onSubmit={props.onSubmit}
      />
    </>
  );
}
