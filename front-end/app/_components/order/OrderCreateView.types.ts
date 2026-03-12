"use client";

import type { OrderItem } from "../../_lib/order-types";
import type { DraftOrder, GoodsDraft } from "./orderHelpers";

export type OrderCreateViewProps = {
  draftOrder: DraftOrder;
  goodsDrafts: GoodsDraft[];
  draftItems: OrderItem[];
  canAddItems: boolean[];
  canSubmitDraft: boolean;
  summaryTotal: number;
  onFillDemo: () => void;
  onOrderChange: <Key extends keyof DraftOrder>(
    key: Key,
    value: DraftOrder[Key],
  ) => void;
  onGoodsChange: (draftId: string, value: string) => void;
  onQuantityChange: (draftId: string, value: string) => void;
  onUnitPriceChange: (draftId: string, value: string) => void;
  onSelectSuggestion: (draftId: string, itemId: string) => void;
  onAddItem: (draftId: string) => void;
  onAddDraftRow: () => void;
  onRemoveDraftRow: (draftId: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
};
