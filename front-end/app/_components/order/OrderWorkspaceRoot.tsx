"use client";

import { useMemo, useState } from "react";
import { createOrder, goodsCatalog, useOrdersStore } from "../../_lib/order-store";
import type { AppRole } from "../../_lib/roles";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { OrderConfirmDialog } from "./OrderConfirmDialog";
import { OrderCreateView } from "./OrderCreateView";
import { OrderDetailView } from "./OrderDetailView";
import { OrderHistoryView } from "./OrderHistoryView";
import { createDemoItems, createDraftOrder, createGoodsDraft, findClosestCatalogItem, getOffsetDateInputValue } from "./orderHelpers";

type Props = { role: AppRole; roleLabel: string };
type Stage = "history" | "create" | "detail";
type Filter = "all" | "summary" | "completed" | "cancelled";

export function OrderWorkspaceRoot({ role, roleLabel }: Props) {
  const canViewHistory = role === "systemAdmin" || role === "inventoryHead";
  const orders = useOrdersStore();
  const [stage, setStage] = useState<Stage>(canViewHistory ? "history" : "create");
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [draftOrder, setDraftOrder] = useState(createDraftOrder);
  const [goodsDrafts, setGoodsDrafts] = useState(() => [createGoodsDraft()]);
  const [draftItems, setDraftItems] = useState(createDemoItems().slice(0, 0));

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;
  const canAddItems = goodsDrafts.map((goodsDraft) => {
    const selectedItem = goodsDraft.selectedItem ?? findClosestCatalogItem(goodsDraft.search);
    return Boolean(selectedItem) && Number(goodsDraft.quantity) > 0 && Number(goodsDraft.unitPrice) > 0;
  });
  const canSubmitDraft = draftOrder.requester.trim().length > 0 && draftOrder.deliveryDate.length > 0 && draftItems.length > 0;
  const summaryTotal = draftItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;
    if (selectedFilter === "completed") return orders.filter((order) => order.status !== "pending_finance" && order.status !== "rejected_finance");
    if (selectedFilter === "cancelled") return orders.filter((order) => order.status === "rejected_finance");
    return orders.filter((order) => order.status === "pending_finance");
  }, [orders, selectedFilter]);

  function resetDraft() {
    setDraftOrder(createDraftOrder());
    setGoodsDrafts([createGoodsDraft()]);
    setDraftItems([]);
  }

  function updateGoodsDraft(draftId: string, updater: (draft: ReturnType<typeof createGoodsDraft>) => ReturnType<typeof createGoodsDraft>) {
    setGoodsDrafts((current) => current.map((draft) => (draft.id === draftId ? updater(draft) : draft)));
  }

  function addDraftItem(draftId: string) {
    const goodsDraft = goodsDrafts.find((draft) => draft.id === draftId);
    if (!goodsDraft) return;
    const selectedItem = goodsDraft.selectedItem ?? findClosestCatalogItem(goodsDraft.search);
    if (!selectedItem || Number(goodsDraft.quantity) <= 0 || Number(goodsDraft.unitPrice) <= 0) return;
    setDraftItems((current) => [...current, { catalogId: selectedItem.id, name: selectedItem.name, code: selectedItem.code, unit: selectedItem.unit, quantity: Number(goodsDraft.quantity), unitPrice: Number(goodsDraft.unitPrice), totalPrice: Number(goodsDraft.quantity) * Number(goodsDraft.unitPrice) }]);
    updateGoodsDraft(draftId, () => createGoodsDraft());
  }

  function openCreateOrder() {
    resetDraft();
    setSelectedOrderId(null);
    setStage("create");
  }

  function submitOrder() {
    const nextOrder = createOrder({ ...draftOrder, requester: draftOrder.requester.trim(), items: draftItems });
    setSelectedOrderId(nextOrder.id);
    resetDraft();
    setConfirmSubmitOpen(false);
    setStage("history");
  }

  return (
    <WorkspaceShell
      title="Inventory order"
      subtitle={`Create and track procurement requests for ${roleLabel}.`}
      hideHeader
      contentAlignment="left"
      contentWidthClassName="max-w-none"
      contentPaddingClassName="pt-[28px] pl-[20px] pr-[40px] lg:pt-[60px] lg:pl-[40px] lg:pr-[60px]"
    >
      {stage === "history" ? <OrderHistoryView orders={filteredOrders} selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} onOpenCreate={openCreateOrder} onOpenDetail={(orderId) => { setSelectedOrderId(orderId); setStage("detail"); }} /> : null}
      {stage === "create" ? <OrderCreateView draftOrder={draftOrder} goodsDrafts={goodsDrafts} draftItems={draftItems} canAddItems={canAddItems} canSubmitDraft={canSubmitDraft} summaryTotal={summaryTotal} onFillDemo={() => { setDraftOrder({ ...createDraftOrder(), requester: "Bat-Erdene", deliveryDate: getOffsetDateInputValue(3) }); setDraftItems(createDemoItems()); setGoodsDrafts([createGoodsDraft()]); }} onOrderChange={(key, value) => setDraftOrder((current) => ({ ...current, [key]: value }))} onGoodsChange={(draftId, value) => updateGoodsDraft(draftId, (current) => ({ ...current, search: value, selectedItem: findClosestCatalogItem(value), unitPrice: findClosestCatalogItem(value)?.defaultPrice?.toString() ?? current.unitPrice }))} onQuantityChange={(draftId, value) => updateGoodsDraft(draftId, (current) => ({ ...current, quantity: value }))} onUnitPriceChange={(draftId, value) => updateGoodsDraft(draftId, (current) => ({ ...current, unitPrice: value }))} onSelectSuggestion={(draftId, itemId) => { const item = goodsCatalog.find((entry) => entry.id === itemId); if (!item) return; updateGoodsDraft(draftId, (current) => ({ ...current, search: item.name, selectedItem: item, quantity: current.quantity || "1", unitPrice: `${item.defaultPrice}` })); }} onAddItem={addDraftItem} onAddDraftRow={() => setGoodsDrafts((current) => [...current, createGoodsDraft()])} onRemoveDraftRow={(draftId) => setGoodsDrafts((current) => current.length > 1 ? current.filter((draft) => draft.id !== draftId) : current)} onRemoveItem={(index) => setDraftItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} onSubmit={() => setConfirmSubmitOpen(true)} /> : null}
      {stage === "detail" && selectedOrder ? <OrderDetailView order={selectedOrder} onBack={() => setStage(canViewHistory ? "history" : "create")} onCreateNote={() => {}} /> : null}
      <OrderConfirmDialog isOpen={confirmSubmitOpen} requestNumber={draftOrder.requestNumber} itemCount={draftItems.length} totalAmount={summaryTotal} onCancel={() => setConfirmSubmitOpen(false)} onConfirm={submitOrder} />
    </WorkspaceShell>
  );
}
