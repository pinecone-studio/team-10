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
    <div className="space-y-[22px]">
      <OrderPageHeader
        title="Inventory Order Request System"
        backLabel="Back to Order History"
        onBack={props.onOpenHistory}
        action={<OrderNotificationButton onOpenDetail={props.onOpenDetail} />}
      />
      <OrderCreateStepper />
      <div className="px-[24px] pb-[34px] pt-0 lg:px-[44px]">
        <div className="grid items-start gap-[22px] xl:grid-cols-[minmax(0,753px)_333px]">
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
            onFillDemo={props.onFillDemo}
            onOrderChange={props.onOrderChange}
            onPermissionMessageChange={props.onPermissionMessageChange}
            onSubmit={props.onSubmit}
          />
        </div>
      </div>
    </div>
  );
}
