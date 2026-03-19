"use client";

import type { AppRole } from "../../_lib/roles";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";
import { OrderCreateView } from "./OrderCreateView";
import { OrderDetailView } from "./OrderDetailView";
import { OrderHistoryView } from "./OrderHistoryView";
import { useOrderWorkspaceState } from "./useOrderWorkspaceState";

type Props = { role: AppRole; roleLabel: string };

export function OrderWorkspaceRoot({ role, roleLabel }: Props) {
  const canViewHistory = role === "systemAdmin" || role === "inventoryHead";
  const state = useOrderWorkspaceState(canViewHistory);

  return (
    <WorkspaceShell
      title="Inventory order"
      subtitle={`Create and track procurement requests for ${roleLabel}.`}
      hideHeader
      contentAlignment="left"
      contentWidthClassName="max-w-none"
      outerClassName="px-0 py-0"
      contentPaddingClassName=""
      backgroundClassName="bg-[#f8fafc]"
    >
      {state.stage === "history" ? (
        <OrderHistoryView
          allOrders={state.orders}
          orders={state.filteredOrders}
          selectedFilter={state.selectedFilter}
          onFilterChange={state.setSelectedFilter}
          onOpenCreate={state.openCreate}
          onOpenDetail={state.openDetail}
          onDeleteOrder={state.deleteOrder}
        />
      ) : null}
      {state.stage === "create" ? (
        <OrderCreateView
          draftOrder={state.draftOrder}
          goodsDrafts={state.goodsDrafts}
          draftItems={state.draftItems}
          canAddItems={state.canAddItems}
          canSubmitDraft={state.canSubmitDraft}
          missingSubmitFields={state.missingSubmitFields}
          summaryTotal={state.summaryTotal}
          permissionMessage={state.permissionMessage}
          onFillDemo={state.loadDemo}
          onOpenHistory={state.openHistory}
          onOrderChange={state.updateDraftOrder}
          onGoodsDraftChange={state.updateGoodsDraftField}
          onPermissionMessageChange={state.setPermissionMessage}
          onAddItem={state.addDraftItem}
          onAddDraftRow={state.addDraftRow}
          onRemoveDraftRow={state.removeDraftRow}
          onUpdateItemQuantity={state.updateItemQuantity}
          onRemoveItem={state.removeItem}
          onOpenDetail={state.openDetail}
          onSubmit={state.submit}
        />
      ) : null}
      {state.stage === "detail" && state.selectedOrder ? (
        <OrderDetailView
          order={state.selectedOrder}
          onBack={canViewHistory ? state.openHistory : state.openCreate}
          onCreateNote={() => {}}
          onDeleteOrder={state.deleteOrder}
        />
      ) : null}
    </WorkspaceShell>
  );
}
