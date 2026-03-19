"use client";

import { OrderCreateDetailsCard } from "./OrderCreateDetailsCard";
import { OrderCreateItemsEditor } from "./OrderCreateItemsEditor";
import { OrderCreateSummarySidebar } from "./OrderCreateSummarySidebar";
import { OrderNotificationButton } from "./OrderNotificationButton";
import { OrderPageHeader } from "./OrderPageHeader";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

export function OrderCreateView(props: OrderCreateViewProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_52%_22%,rgba(191,219,254,0.72)_0%,rgba(191,219,254,0.34)_18%,rgba(191,219,254,0.12)_34%,rgba(191,219,254,0)_56%),radial-gradient(ellipse_at_85%_78%,rgba(186,230,253,0.34)_0%,rgba(186,230,253,0.18)_20%,rgba(186,230,253,0.08)_34%,rgba(186,230,253,0)_54%),radial-gradient(ellipse_at_72%_58%,rgba(191,219,254,0.18)_0%,rgba(191,219,254,0.09)_18%,rgba(191,219,254,0.03)_32%,rgba(191,219,254,0)_48%),linear-gradient(180deg,#ffffff_0%,#ffffff_14%,#f8fbff_30%,#f5faff_54%,#ffffff_100%)] pt-[60px]">
      <OrderPageHeader
        title="Inventory Order Request System"
        backLabel="Back to Order History"
        onBack={props.onOpenHistory}
        action={<OrderNotificationButton onOpenDetail={props.onOpenDetail} />}
      />
      <div className="border-t border-[#d9e9fb]" />
      <div className="px-[40px] pb-12 pt-10">
        <div className="mx-auto grid max-w-[1440px] gap-6 xl:grid-cols-[minmax(0,1fr)_350px] xl:items-start">
          <div className="flex min-h-0 flex-col overflow-hidden rounded-[22px] border border-[#dbeafb] bg-white shadow-[0_14px_40px_rgba(125,170,232,0.18),0_8px_18px_rgba(15,23,42,0.08)] xl:h-[800px]">
            <OrderCreateDetailsCard
              draftOrder={props.draftOrder}
              onOrderChange={props.onOrderChange}
            />
            <OrderCreateItemsEditor
              goodsDrafts={props.goodsDrafts}
              canAddItems={props.canAddItems}
              onGoodsDraftChange={props.onGoodsDraftChange}
              onAddItem={props.onAddItem}
              onRemoveItem={props.onRemoveDraftRow}
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
