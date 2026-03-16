"use client";

import { useMemo, useState } from "react";
import { createOrder, useOrdersStore } from "../../_lib/order-store";
import type { OrderItem } from "../../_lib/order-types";
import { useCatalogStore } from "../../_lib/catalog-store";
import { buildDemoDraftItems } from "./orderDemoData";
import {
  DEFAULT_ORDER_REQUESTER,
  createDraftOrder,
  createGoodsDraft,
  getOffsetDateInputValue,
} from "./orderDraftState";
import {
  getDefaultHigherUpApproverId,
  getHigherUpApproverById,
} from "./orderApprovers";
type Stage = "history" | "create" | "detail";
type Filter = "all" | "pending" | "completed" | "cancelled";

export function useOrderWorkspaceState(canViewHistory: boolean) {
  const orders = useOrdersStore();
  const catalog = useCatalogStore();
  const [stage, setStage] = useState<Stage>(canViewHistory ? "history" : "create");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [draftOrder, setDraftOrder] = useState(createDraftOrder);
  const [goodsDrafts, setGoodsDrafts] = useState(() => [createGoodsDraft()]);
  const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
  const [permissionMessage, setPermissionMessage] = useState("");

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const canAddItems = goodsDrafts.map((goodsDraft) => {
    const selectedProduct = catalog.products.find(
      (product) => product.id === goodsDraft.selectedCatalogProductId,
    );
    return Boolean(selectedProduct) && Number(goodsDraft.quantity) > 0 && Number(goodsDraft.unitPrice) > 0;
  });
  const canSubmitDraft = Boolean(
    draftOrder.deliveryDate &&
      draftItems.length > 0 &&
      draftOrder.requestedApproverId.trim(),
  );
  const missingSubmitFields = [
    !draftOrder.deliveryDate && "Delivery date",
    draftItems.length === 0 && "At least one added good",
    !draftOrder.requestedApproverId.trim() && "Approver",
  ].filter(Boolean) as string[];
  const summaryTotal = draftItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const filteredOrders = useMemo(() => filterOrders(orders, selectedFilter), [orders, selectedFilter]);
  function resetDraft() {
    setDraftOrder(createDraftOrder());
    setGoodsDrafts([createGoodsDraft()]);
    setDraftItems([]);
    setPermissionMessage("");
  }

  function updateDraftOrder<Key extends keyof typeof draftOrder>(
    key: Key,
    value: (typeof draftOrder)[Key],
  ) {
    setDraftOrder((current) => ({ ...current, [key]: value }));
  }

  function updateGoodsDraft(draftId: string, updates: Partial<(typeof goodsDrafts)[number]>) {
    setGoodsDrafts((current) =>
      current.map((draft) => (draft.id === draftId ? { ...draft, ...updates } : draft)),
    );
  }

  function selectCatalogProduct(draftId: string, productId: string) {
    const product = catalog.products.find((entry) => entry.id === productId);
    if (!product) return;
    updateGoodsDraft(draftId, {
      selectedCatalogProductId: product.id,
      quantity: "1",
      unitPrice: `${product.defaultPrice}`,
    });
  }

  function addDraftItem(draftId: string) {
    const goodsDraft = goodsDrafts.find((draft) => draft.id === draftId);
    const product = catalog.products.find((entry) => entry.id === goodsDraft?.selectedCatalogProductId);
    if (!goodsDraft || !product || Number(goodsDraft.quantity) <= 0) return;
    setDraftItems((current) => [
      ...current,
      createOrderItem(product.id, product.name, product.code, product.unit, Number(goodsDraft.quantity), Number(goodsDraft.unitPrice), product.currencyCode),
    ]);
    setGoodsDrafts((current) => current.map((draft) => (draft.id === draftId ? createGoodsDraft() : draft)));
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
    updateDraftOrder,
    setPermissionMessage,
    updateGoodsQuantity: (draftId: string, value: string) => updateGoodsDraft(draftId, { quantity: value }),
    selectCatalogProduct,
    addDraftItem,
    addDraftRow: () => setGoodsDrafts((current) => [...current, createGoodsDraft()]),
    removeDraftRow: (draftId: string) => setGoodsDrafts((current) => current.length > 1 ? current.filter((draft) => draft.id !== draftId) : current),
    updateItemQuantity: (index: number, value: string) => {
      const nextQuantity = Number(value);
      if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) return;
      setDraftItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, quantity: nextQuantity, totalPrice: nextQuantity * item.unitPrice } : item));
    },
    removeItem: (index: number) => setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index)),
    loadDemo: async () => {
      setDraftOrder({
        ...createDraftOrder(),
        requester: DEFAULT_ORDER_REQUESTER,
        deliveryDate: getOffsetDateInputValue(3),
        requestedApproverId: getDefaultHigherUpApproverId("IT Office"),
      });
      setDraftItems(await buildDemoDraftItems());
      setGoodsDrafts([createGoodsDraft()]);
    },
    submit: async () => {
      const selectedApprover = getHigherUpApproverById(draftOrder.requestedApproverId);
      const resolvedRequester = draftOrder.requester.trim() || DEFAULT_ORDER_REQUESTER;
      const resolvedOrderName =
        draftOrder.orderName.trim() ||
        draftItems[0]?.name ||
        `${draftOrder.department} inventory request`;
      const nextOrder = await createOrder({
        orderName: resolvedOrderName,
        requestNumber: draftOrder.requestNumber,
        requestDate: draftOrder.requestDate,
        department: draftOrder.department,
        requester: resolvedRequester,
        deliveryDate: draftOrder.deliveryDate,
        approvalTarget: draftOrder.approvalTarget,
        items: draftItems,
        currencyCode: draftItems[0]?.currencyCode ?? "MNT",
        requestedApproverId: draftOrder.requestedApproverId,
        requestedApproverName: selectedApprover?.fullName ?? null,
        requestedApproverRole: selectedApprover?.positionLabel ?? null,
        approvalMessage: permissionMessage,
      });
      setSelectedOrderId(nextOrder.id);
      resetDraft();
      setStage(canViewHistory ? "history" : "detail");
    },
  };
}

function filterOrders(orders: ReturnType<typeof useOrdersStore>, filter: Filter) {
  if (filter === "all") return orders;
  if (filter === "completed") {
    return orders.filter((order) => ["approved_finance", "received_inventory", "assigned_hr"].includes(order.status));
  }
  if (filter === "cancelled") {
    return orders.filter((order) => ["rejected_higher_up", "rejected_finance"].includes(order.status));
  }
  return orders.filter((order) => ["pending_higher_up", "pending_finance"].includes(order.status));
}

function createOrderItem(
  catalogId: string,
  name: string,
  code: string,
  unit: string,
  quantity: number,
  unitPrice: number,
  currencyCode: OrderItem["currencyCode"],
) {
  return { catalogId, name, code, unit, quantity, unitPrice, totalPrice: quantity * unitPrice, currencyCode };
}
