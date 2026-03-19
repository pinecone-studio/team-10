"use client";

import { useMemo, useState } from "react";
import { createOrder, deletePendingOrder, useOrdersStore } from "../../_lib/order-store";
import type { OrderItem } from "../../_lib/order-types";
import { buildDemoDraftItems } from "./orderDemoData";
import {
  DEFAULT_ORDER_REQUESTER,
  createDraftOrder,
  createGoodsDraft,
  generateFourDigitItemCode,
  getOffsetDateInputValue,
} from "./orderDraftState";
import {
  getHigherUpApproverById,
} from "./orderApprovers";
import { createOrderItem, filterOrders } from "./orderWorkspaceHelpers";

type Stage = "history" | "create" | "detail";
type Filter = "all" | "pending" | "completed" | "cancelled";

export function useOrderWorkspaceState(canViewHistory: boolean) {
  const orders = useOrdersStore();
  const [stage, setStage] = useState<Stage>(canViewHistory ? "history" : "create");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState(createDraftOrder);
  const [goodsDrafts, setGoodsDrafts] = useState(() => [createGoodsDraft()]);
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [permissionMessage, setPermissionMessage] = useState("");

  function getNextGoodsCode(extraCodes: string[] = []) {
    return generateFourDigitItemCode([
      ...orders.map((order) => order.items.map((item) => item.code)).flat(),
      ...draftItems.map((item) => item.code),
      ...goodsDrafts.map((draft) => draft.code),
      ...extraCodes,
    ]);
  }

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const canAddItems = goodsDrafts.map((goodsDraft) =>
    Boolean(
      goodsDraft.itemName.trim() &&
        goodsDraft.code.trim() &&
        Number(goodsDraft.quantity) > 0 &&
        Number(goodsDraft.unitPrice) > 0,
    ),
  );
  const canSubmitDraft = Boolean(
    draftOrder.deliveryDate &&
      draftItems.length > 0,
  );
  const missingSubmitFields = [
    !draftOrder.deliveryDate && "Delivery date",
    draftItems.length === 0 && "At least one added good",
  ].filter(Boolean) as string[];
  const summaryTotal = draftItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const filteredOrders = useMemo(() => filterOrders(orders, selectedFilter), [orders, selectedFilter]);
  function resetDraft() {
    setDraftOrder(createDraftOrder());
    setGoodsDrafts([createGoodsDraft(getNextGoodsCode())]);
    setDraftItems([]);
    setPermissionMessage("");
  }

  function updateDraftOrder<Key extends keyof typeof draftOrder>(
    key: Key,
    value: (typeof draftOrder)[Key],
  ) {
    setDraftOrder((current) => {
      return { ...current, [key]: value };
    });
  }

  function updateGoodsDraft(draftId: string, updates: Partial<(typeof goodsDrafts)[number]>) {
    setGoodsDrafts((current) =>
      current.map((draft) => (draft.id === draftId ? { ...draft, ...updates } : draft)),
    );
  }

  function updateGoodsDraftField<Key extends keyof (typeof goodsDrafts)[number]>(
    draftId: string,
    key: Key,
    value: (typeof goodsDrafts)[number][Key],
  ) {
    const nextValue =
      (key === "quantity" || key === "unitPrice") && Number(value) < 0 ? "0" : value;
    updateGoodsDraft(draftId, { [key]: nextValue });
  }

  function addDraftItem(draftId: string) {
    const goodsDraft = goodsDrafts.find((draft) => draft.id === draftId);
    if (!goodsDraft || Number(goodsDraft.quantity) <= 0 || Number(goodsDraft.unitPrice) <= 0) return;
    setDraftItems((current) => [
      ...current,
      createOrderItem(
        goodsDraft.id,
        goodsDraft.itemName.trim(),
        goodsDraft.code.trim(),
        goodsDraft.unit.trim() || "pcs",
        Number(goodsDraft.quantity),
        Number(goodsDraft.unitPrice),
        goodsDraft.currencyCode,
      ),
    ]);
    setGoodsDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId ? createGoodsDraft(getNextGoodsCode([goodsDraft.code])) : draft,
      ),
    );
  }

  async function handleDeleteOrder(orderId: string) {
    try {
      const targetOrder = orders.find((order) => order.id === orderId);
      if (!targetOrder) return;

      const confirmed =
        typeof window === "undefined"
          ? true
          : window.confirm(`Delete pending order ${targetOrder.requestNumber}?`);
      if (!confirmed) return;

      await deletePendingOrder(orderId);

      if (selectedOrderId === orderId) {
        setSelectedOrderId(null);
        setStage(canViewHistory ? "history" : "create");
      }
    } catch (error) {
      console.error("Failed to delete pending order.", error);
    }
  }

  return {
    orders,
    stage,
    selectedOrder,
    selectedFilter,
    filteredOrders,
    draftOrder,
    goodsDrafts,
    draftItems,
    permissionMessage,
    canAddItems,
    canSubmitDraft,
    missingSubmitFields,
    summaryTotal,
    setSelectedFilter,
    openCreate: () => { resetDraft(); setSelectedOrderId(null); setStage("create"); },
    openHistory: () => { if (canViewHistory) { setStage("history"); setSelectedOrderId(null); } },
    openDetail: (orderId: string) => { setSelectedOrderId(orderId); setStage("detail"); },
    deleteOrder: handleDeleteOrder,
    updateDraftOrder,
    setPermissionMessage,
    updateGoodsDraftField,
    addDraftItem,
    addDraftRow: () =>
      setGoodsDrafts((current) => [
        ...current,
        createGoodsDraft(getNextGoodsCode()),
      ]),
    removeDraftRow: (draftId: string) => setGoodsDrafts((current) => current.length > 1 ? current.filter((draft) => draft.id !== draftId) : current),
    updateItemQuantity: (index: number, value: string) => {
      const nextQuantity = Math.max(0, Number(value));
      if (!Number.isInteger(nextQuantity)) return;
      setDraftItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: nextQuantity, totalPrice: nextQuantity * item.unitPrice } : item));
    },
    removeItem: (index: number) => setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index)),
    loadDemo: async () => {
      setDraftOrder({
        ...createDraftOrder(),
        requester: DEFAULT_ORDER_REQUESTER,
        deliveryDate: getOffsetDateInputValue(3),
        requestedApproverId: "finance-review",
      });
      setDraftItems(await buildDemoDraftItems());
      setGoodsDrafts([createGoodsDraft(getNextGoodsCode())]);
    },
    submit: async () => {
      const resolvedRequester = draftOrder.requester.trim() || DEFAULT_ORDER_REQUESTER;
      const resolvedOrderName =
        draftOrder.orderName.trim() ||
        draftItems[0]?.name ||
        `${draftOrder.department} inventory request`;
      const selectedApprover = getHigherUpApproverById(draftOrder.requestedApproverId);
      const nextOrder = await createOrder({
        orderName: resolvedOrderName,
        requestNumber: draftOrder.requestNumber,
        requestDate: draftOrder.requestDate,
        department: draftOrder.department,
        requester: resolvedRequester,
        deliveryDate: draftOrder.deliveryDate,
        approvalTarget: "finance",
        items: draftItems,
        requestedApproverId: "finance-review",
        requestedApproverName: selectedApprover?.fullName ?? "Finance",
        requestedApproverRole: selectedApprover?.positionLabel ?? "Finance Reviewer",
        approvalMessage: permissionMessage,
      });
      setSelectedOrderId(nextOrder.id);
      resetDraft();
      setStage(canViewHistory ? "history" : "detail");
    },
  };
}
