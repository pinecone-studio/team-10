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
  submitError: string | null;
  onFillDemo: () => void | Promise<void>;
  onOpenHistory: () => void;
  onOrderChange: <Key extends keyof DraftOrder>(
    key: Key,
    value: DraftOrder[Key],
  ) => void;
  onGoodsDraftChange: <Key extends keyof GoodsDraft>(
    draftId: string,
    key: Key,
    value: GoodsDraft[Key],
  ) => void;
  onPermissionMessageChange: (value: string) => void;
  onAddItem: () => void;
  onAddDraftRow: () => void;
  onRemoveDraftRow: (draftId: string) => void;
  onUpdateItemQuantity: (draftId: string, value: string) => void;
  onRemoveItem: (draftId: string) => void;
  onOpenDetail: (orderId: string) => void;
  onSubmit: () => void;
};
