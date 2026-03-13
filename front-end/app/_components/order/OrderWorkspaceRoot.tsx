"use client";

import { useMemo, useState } from "react";
import {
  createCatalogCategory,
  createCatalogProduct,
  loadCatalogSnapshot,
  useCatalogStore,
} from "../../_lib/catalog-store";
import { createOrder, useOrdersStore } from "../../_lib/order-store";
import type { OrderItem } from "../../_lib/order-types";
import type { AppRole } from "../../_lib/roles";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { OrderCreateView } from "./OrderCreateView";
import { OrderDetailView } from "./OrderDetailView";
import { OrderHistoryView } from "./OrderHistoryView";
import { OrderPermissionRequestView } from "./OrderPermissionRequestView";
import { OrderSubmitFinalView } from "./OrderSubmitFinalView";
import {
  createDraftOrder,
  createGoodsDraft,
  getDefaultHigherUpApproverId,
  getOffsetDateInputValue,
} from "./orderHelpers";

type Props = { role: AppRole; roleLabel: string };
type Stage = "history" | "create" | "permission" | "submit" | "detail";
type Filter = "all" | "summary" | "completed" | "cancelled";

export function OrderWorkspaceRoot({ role, roleLabel }: Props) {
  const canViewHistory = role === "systemAdmin" || role === "inventoryHead";
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
  const canSubmitDraft =
    draftOrder.orderName.trim().length > 0 &&
    draftOrder.requester.trim().length > 0 &&
    draftOrder.deliveryDate.length > 0 &&
    draftItems.length > 0;
  const missingSubmitFields = [
    ...(draftOrder.orderName.trim().length === 0 ? ["Order name"] : []),
    ...(draftOrder.requester.trim().length === 0 ? ["Requester"] : []),
    ...(draftOrder.deliveryDate.length === 0 ? ["Delivery date"] : []),
    ...(draftItems.length === 0 ? ["At least one added good"] : []),
  ];
  const canRequestApproval = draftOrder.requestedApproverId.trim().length > 0;
  const summaryTotal = draftItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const filteredOrders = useMemo(() => {
    if (selectedFilter === "all") return orders;
    if (selectedFilter === "completed") {
      return orders.filter(
        (order) =>
          order.status === "approved_finance" ||
          order.status === "received_inventory" ||
          order.status === "assigned_hr",
      );
    }
    if (selectedFilter === "cancelled") {
      return orders.filter(
        (order) =>
          order.status === "rejected_higher_up" ||
          order.status === "rejected_finance",
      );
    }
    return orders.filter(
      (order) =>
        order.status === "pending_higher_up" || order.status === "pending_finance",
    );
  }, [orders, selectedFilter]);

  function resetDraft() {
    setDraftOrder(createDraftOrder());
    setGoodsDrafts([createGoodsDraft()]);
    setDraftItems([]);
    setPermissionMessage("");
  }

  function updateGoodsDraft(
    draftId: string,
    updater: (draft: ReturnType<typeof createGoodsDraft>) => ReturnType<typeof createGoodsDraft>,
  ) {
    setGoodsDrafts((current) =>
      current.map((draft) => (draft.id === draftId ? updater(draft) : draft)),
    );
  }

  function syncCatalogProductSnapshots(productId: string) {
    const product = catalog.products.find((entry) => entry.id === productId);
    if (!product) return;

    setGoodsDrafts((current) =>
      current.map((draft) =>
        draft.selectedCatalogProductId === product.id
          ? { ...draft, unitPrice: `${product.defaultPrice}` }
          : draft,
      ),
    );

    setDraftItems((current) =>
      current.map((item) =>
        item.catalogId === product.id
          ? {
              ...item,
              name: product.name,
              code: product.code,
              unit: product.unit,
              unitPrice: product.defaultPrice,
              totalPrice: item.quantity * product.defaultPrice,
              currencyCode: product.currencyCode,
            }
          : item,
      ),
    );
  }

  function addDraftItem(draftId: string) {
    const goodsDraft = goodsDrafts.find((draft) => draft.id === draftId);
    if (!goodsDraft) return;
    const selectedProduct = catalog.products.find(
      (product) => product.id === goodsDraft.selectedCatalogProductId,
    );
    if (!selectedProduct || Number(goodsDraft.quantity) <= 0 || Number(goodsDraft.unitPrice) <= 0) {
      return;
    }

    setDraftItems((current) => [
      ...current,
      {
        catalogId: selectedProduct.id,
        name: selectedProduct.name,
        code: selectedProduct.code,
        unit: selectedProduct.unit,
        quantity: Number(goodsDraft.quantity),
        unitPrice: Number(goodsDraft.unitPrice),
        totalPrice: Number(goodsDraft.quantity) * Number(goodsDraft.unitPrice),
        currencyCode: selectedProduct.currencyCode,
      },
    ]);
    updateGoodsDraft(draftId, () => createGoodsDraft());
  }

  function updateDraftItemQuantity(index: number, value: string) {
    if (value.trim().length === 0) return;

    const nextQuantity = Number(value);
    if (!Number.isInteger(nextQuantity) || nextQuantity <= 0) return;

    setDraftItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              quantity: nextQuantity,
              totalPrice: nextQuantity * item.unitPrice,
            }
          : item,
      ),
    );
  }

  function openCreateOrder() {
    resetDraft();
    setSelectedOrderId(null);
    setStage("create");
  }

  function openHistory() {
    if (!canViewHistory) return;
    setStage("history");
    setSelectedOrderId(null);
  }

  function openPermissionRequest() {
    if (!canSubmitDraft) return;
    setStage("permission");
  }

  function openSubmitStage() {
    if (!canRequestApproval) return;
    setStage("submit");
  }

  function submitOrder() {
    const nextOrder = createOrder({
      orderName: draftOrder.orderName.trim(),
      requestNumber: draftOrder.requestNumber,
      requestDate: draftOrder.requestDate,
      department: draftOrder.department,
      requester: draftOrder.requester.trim(),
      deliveryDate: draftOrder.deliveryDate,
      approvalTarget: draftOrder.approvalTarget,
      items: draftItems,
      currencyCode: draftItems[0]?.currencyCode ?? "MNT",
    });

    setSelectedOrderId(nextOrder.id);
    resetDraft();
    setStage(canViewHistory ? "history" : "detail");
  }

  async function buildDemoDraftItems() {
    const initialCatalogSnapshot = await loadCatalogSnapshot();

    const itCategory =
      initialCatalogSnapshot.categories.find(
        (category) => category.name === "IT Equipment",
      ) ??
      (await createCatalogCategory("IT Equipment")).category;
    const sportsCategory =
      initialCatalogSnapshot.categories.find(
        (category) => category.name === "Sports Equipment",
      ) ??
      (await createCatalogCategory("Sports Equipment")).category;

    const latestCatalogSnapshot = await loadCatalogSnapshot();
    const latestProductsByCode = new Map(
      latestCatalogSnapshot.products.map((product) => [product.code, product]),
    );

    const logitechProduct =
      latestProductsByCode.get("LMXK001") ??
      (await createCatalogProduct({
        name: "Logitech MX Keys",
        code: "LMXK001",
        categoryId: itCategory.id,
        itemTypeName: "Keyboard",
        currencyCode: "MNT",
        defaultPrice: 123000,
        description: "Demo catalog product for order creation.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));
    const basketballProduct =
      latestProductsByCode.get("BASK001") ??
      (await createCatalogProduct({
        name: "Basketball",
        code: "BASK001",
        categoryId: sportsCategory.id,
        itemTypeName: "Ball",
        currencyCode: "MNT",
        defaultPrice: 24324,
        description: "Demo catalog product for order creation.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));

    return [
      {
        catalogId: logitechProduct.id,
        name: logitechProduct.name,
        code: logitechProduct.code,
        unit: logitechProduct.unit,
        quantity: 2,
        unitPrice: logitechProduct.defaultPrice,
        totalPrice: 2 * logitechProduct.defaultPrice,
        currencyCode: logitechProduct.currencyCode,
      },
      {
        catalogId: basketballProduct.id,
        name: basketballProduct.name,
        code: basketballProduct.code,
        unit: basketballProduct.unit,
        quantity: 1,
        unitPrice: basketballProduct.defaultPrice,
        totalPrice: basketballProduct.defaultPrice,
        currencyCode: basketballProduct.currencyCode,
      },
    ];
  }

  return (
    <WorkspaceShell
      title="Inventory order"
      subtitle={`Create and track procurement requests for ${roleLabel}.`}
      hideHeader
      contentAlignment="left"
      contentWidthClassName="max-w-none"
      contentPaddingClassName="pt-[10px] pl-[20px] pr-[40px] lg:pt-[18px] lg:pl-[40px] lg:pr-[60px]"
    >
      {stage === "history" ? (
        <OrderHistoryView
          orders={filteredOrders}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
          onOpenCreate={openCreateOrder}
          onOpenDetail={(orderId) => {
            setSelectedOrderId(orderId);
            setStage("detail");
          }}
        />
      ) : null}
      {stage === "create" ? (
        <OrderCreateView
          draftOrder={draftOrder}
          goodsDrafts={goodsDrafts}
          draftItems={draftItems}
          canAddItems={canAddItems}
          canSubmitDraft={canSubmitDraft}
          missingSubmitFields={missingSubmitFields}
          summaryTotal={summaryTotal}
          onFillDemo={async () => {
            setDraftOrder({
              ...createDraftOrder(),
              orderName: "Office and sports goods restock",
              requester: "Bat-Erdene",
              deliveryDate: getOffsetDateInputValue(3),
              requestedApproverId: getDefaultHigherUpApproverId("IT Office"),
            });
            setDraftItems(await buildDemoDraftItems());
            setGoodsDrafts([createGoodsDraft()]);
          }}
          onOpenHistory={openHistory}
          onOrderChange={(key, value) =>
            setDraftOrder((current) => ({ ...current, [key]: value }))
          }
          onQuantityChange={(draftId, value) =>
            updateGoodsDraft(draftId, (current) => ({ ...current, quantity: value }))
          }
          onSelectCatalogProduct={(draftId, productId) => {
            const product = catalog.products.find((entry) => entry.id === productId);
            if (!product) return;
            updateGoodsDraft(draftId, (current) => ({
              ...current,
              selectedCatalogProductId: product.id,
              quantity: current.quantity || "1",
              unitPrice: `${product.defaultPrice}`,
            }));
          }}
          onCatalogProductUpdated={syncCatalogProductSnapshots}
          onAddItem={addDraftItem}
          onAddDraftRow={() =>
            setGoodsDrafts((current) => [...current, createGoodsDraft()])
          }
          onRemoveDraftRow={(draftId) =>
            setGoodsDrafts((current) =>
              current.length > 1
                ? current.filter((draft) => draft.id !== draftId)
                : current,
            )
          }
          onUpdateItemQuantity={updateDraftItemQuantity}
          onRemoveItem={(index) =>
            setDraftItems((current) =>
              current.filter((_, itemIndex) => itemIndex !== index),
            )
          }
          onSubmit={openPermissionRequest}
        />
      ) : null}
      {stage === "permission" ? (
        <OrderPermissionRequestView
          draftOrder={draftOrder}
          draftItems={draftItems}
          summaryTotal={summaryTotal}
          permissionMessage={permissionMessage}
          selectedApproverId={draftOrder.requestedApproverId}
          canRequestApproval={canRequestApproval}
          onPermissionMessageChange={setPermissionMessage}
          onApproverChange={(approverId) =>
            setDraftOrder((current) => ({
              ...current,
              requestedApproverId: approverId,
            }))
          }
          onBack={() => setStage("create")}
          onRequestApproval={openSubmitStage}
          onOpenHistory={openHistory}
          onCatalogProductUpdated={syncCatalogProductSnapshots}
        />
      ) : null}
      {stage === "submit" ? (
        <OrderSubmitFinalView
          draftOrder={draftOrder}
          draftItems={draftItems}
          summaryTotal={summaryTotal}
          selectedApproverId={draftOrder.requestedApproverId}
          onBack={() => setStage("permission")}
          onSubmitOrder={submitOrder}
          onOpenHistory={openHistory}
          onCatalogProductUpdated={syncCatalogProductSnapshots}
        />
      ) : null}
      {stage === "detail" && selectedOrder ? (
        <OrderDetailView
          order={selectedOrder}
          onBack={() => setStage(canViewHistory ? "history" : "create")}
          onCreateNote={() => {}}
        />
      ) : null}
    </WorkspaceShell>
  );
}
