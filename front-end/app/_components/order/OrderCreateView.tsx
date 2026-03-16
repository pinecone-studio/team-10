"use client";

import { OrderCreateDetailsCard } from "./OrderCreateDetailsCard";
import { OrderCreateItemsEditor } from "./OrderCreateItemsEditor";
import { OrderCreateSummarySidebar } from "./OrderCreateSummarySidebar";
import { OrderCreateStepper } from "./OrderCreateStepper";
import { OrderNotificationButton } from "./OrderNotificationButton";
import { OrderPageHeader } from "./OrderPageHeader";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

export function OrderCreateView(props: OrderCreateViewProps) {
  return (
    <div className="space-y-6">
      <OrderPageHeader
        title="Inventory Order Request System"
        backLabel="Back to Order History"
        onBack={props.onOpenHistory}
        action={<OrderNotificationButton onOpenDetail={props.onOpenDetail} />}
      />
      <OrderCreateStepper />
      <div className="px-9 pb-9 pt-8">
        <div className="grid gap-6 xl:grid-cols-[1.9fr_0.85fr]">
          <div className="space-y-6">
            <OrderCreateDetailsCard
              draftOrder={props.draftOrder}
              onOrderChange={props.onOrderChange}
            />
            <OrderCreateItemsEditor
              goodsDrafts={props.goodsDrafts}
              canAddItems={props.canAddItems}
              draftItems={props.draftItems}
              onGoodsDraftChange={props.onGoodsDraftChange}
              onAddItem={props.onAddItem}
              onUpdateItemQuantity={props.onUpdateItemQuantity}
            />
          </div>
          <OrderCreateSummarySidebar
            draftOrder={props.draftOrder}
            draftItems={props.draftItems}
            permissionMessage={props.permissionMessage}
            canSubmitDraft={props.canSubmitDraft}
            missingSubmitFields={props.missingSubmitFields}
            onOrderChange={props.onOrderChange}
            onPermissionMessageChange={props.onPermissionMessageChange}
            onSubmit={props.onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
