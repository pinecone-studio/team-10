"use client";

import { useMemo, useState } from "react";
import { createOrder, deletePendingOrder, useOrdersStore } from "../../_lib/order-store";
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
import {
  convertGoodsDraftToOrderItem,
  filterOrders,
  hasDraftContent,
  isDraftSubmittable,
} from "./orderWorkspaceHelpers";

type Stage = "history" | "create" | "detail";
type Filter = "all" | "pending" | "completed" | "cancelled";

export function useOrderWorkspaceState(canViewHistory: boolean) {
  const orders = useOrdersStore();
  const [stage, setStage] = useState<Stage>(canViewHistory ? "history" : "create");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState(createDraftOrder);
  const [goodsDrafts, setGoodsDrafts] = useState(() => [createGoodsDraft()]);
  const [permissionMessage, setPermissionMessage] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  function getNextGoodsCode(extraCodes: string[] = []) {
    return generateFourDigitItemCode([
      ...orders.map((order) => order.items.map((item) => item.code)).flat(),
      ...goodsDrafts.map((draft) => draft.code),
      ...extraCodes,
    ]);
  }

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const draftItems = useMemo(
    () => goodsDrafts.filter(isDraftSubmittable).map(convertGoodsDraftToOrderItem),
    [goodsDrafts],
  );
  const canAddItems = goodsDrafts.map(isDraftSubmittable);
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
    setPermissionMessage("");
    setSubmitError(null);
  }

  function updateDraftOrder<Key extends keyof typeof draftOrder>(
    key: Key,
    value: (typeof draftOrder)[Key],
  ) {
    if (submitError) {
      setSubmitError(null);
    }
    setDraftOrder((current) => {
      return { ...current, [key]: value };
    });
  }

  function updateGoodsDraft(draftId: string, updates: Partial<(typeof goodsDrafts)[number]>) {
    if (submitError) {
      setSubmitError(null);
    }
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

  function addDraftItem() {
    if (submitError) {
      setSubmitError(null);
    }
    setGoodsDrafts((current) => {
      const hasEmptyRow = current.some((draft) => !hasDraftContent(draft));
      if (hasEmptyRow) return current;
      return [...current, createGoodsDraft(getNextGoodsCode())];
    });
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
    submitError,
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
    setPermissionMessage: (value: string) => {
      setPermissionMessage(value);
      if (submitError) {
        setSubmitError(null);
      }
    },
    updateGoodsDraftField,
    addDraftItem,
    addDraftRow: () =>
      {
        if (submitError) {
          setSubmitError(null);
        }
        setGoodsDrafts((current) => [
          ...current,
          createGoodsDraft(getNextGoodsCode()),
        ]);
      },
    removeDraftRow: (draftId: string) =>
      {
        if (submitError) {
          setSubmitError(null);
        }
        setGoodsDrafts((current) => {
          if (current.length === 1) {
            return [createGoodsDraft(current[0]?.code || getNextGoodsCode())];
          }

          return current.filter((draft) => draft.id !== draftId);
        });
      },
    updateItemQuantity: (draftId: string, value: string) => {
      const nextQuantity = Math.max(0, Number(value));
      if (!Number.isInteger(nextQuantity)) return;
      updateGoodsDraft(draftId, { quantity: String(nextQuantity) });
    },
    removeItem: (draftId: string) =>
      {
        if (submitError) {
          setSubmitError(null);
        }
        setGoodsDrafts((current) => {
          if (current.length === 1) {
            return [createGoodsDraft(current[0]?.code || getNextGoodsCode())];
          }

          return current.filter((draft) => draft.id !== draftId);
        });
      },
    loadDemo: async () => {
      const demoDraftItems = await buildDemoDraftItems();
      setDraftOrder({
        ...createDraftOrder(),
        requester: DEFAULT_ORDER_REQUESTER,
        deliveryDate: getOffsetDateInputValue(3),
        requestedApproverId: "finance-review",
      });
      setGoodsDrafts([
        ...demoDraftItems.map((item) => ({
          id: item.catalogId,
          itemName: item.name,
          code: item.code,
          quantity: String(item.quantity),
          unit: item.unit,
          unitPrice: String(item.unitPrice),
          currencyCode: item.currencyCode,
        })),
        createGoodsDraft(getNextGoodsCode(demoDraftItems.map((item) => item.code))),
      ]);
    },
    submit: async () => {
      setSubmitError(null);
      try {
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
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : "Failed to create order.",
        );
      }
    },
  };
}
