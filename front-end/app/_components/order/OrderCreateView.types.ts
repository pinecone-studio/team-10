"use client";

import type { OrderItem } from "../../_lib/order-types";
import type { DraftOrder, GoodsDraft } from "./orderDraftState";

export type OrderCreateViewProps = {
  draftOrder: DraftOrder;
  goodsDrafts: GoodsDraft[];
  draftItems: OrderItem[];
  canAddItems: boolean[];
  canSubmitDraft: boolean;
  missingSubmitFields: string[];
  summaryTotal: number;
  permissionMessage: string;
  onFillDemo: () => void | Promise<void>;
  onOpenHistory: () => void;
  onOrderChange: <Key extends keyof DraftOrder>(
    key: Key,
    value: DraftOrder[Key],
  ) => void;
  onPermissionMessageChange: (value: string) => void;
  onQuantityChange: (draftId: string, value: string) => void;
  onSelectCatalogProduct: (draftId: string, productId: string) => void;
  onAddItem: (draftId: string) => void;
  onAddDraftRow: () => void;
  onRemoveDraftRow: (draftId: string) => void;
  onUpdateItemQuantity: (index: number, value: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
};
