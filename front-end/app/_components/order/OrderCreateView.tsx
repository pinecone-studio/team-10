"use client";

import { formatDisplayDate } from "../../_lib/order-store";
import { departmentOptions } from "../../_lib/order-catalog";
import { OrderCreateItemsEditor } from "./OrderCreateItemsEditor";
import { OrderCreateSidebar } from "./OrderCreateSidebar";
import { OrderCreateStepper } from "./OrderCreateStepper";
import { Field, Input, Select } from "./OrderFormFields";
import { OrderPageHeader } from "./OrderPageHeader";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

export function OrderCreateView(props: OrderCreateViewProps) {
  return (
    <div className="space-y-6">
      <OrderPageHeader
        title="Inventory Order Request System"
        backLabel="Back to Order History"
        onBack={props.onOpenHistory}
        action={
          <button
            type="button"
            onClick={() => void props.onFillDemo()}
            className="inline-flex h-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white px-4 text-sm text-[#111827]"
          >
            Load demo
          </button>
        }
      />
      <OrderCreateStepper />
      <div className="grid gap-6 px-9 pb-9 xl:grid-cols-[1.9fr_0.85fr]">
        <section className="rounded-[18px] border border-[#d9e0e8] bg-white">
          <div className="border-b border-[#eef2f6] px-5 py-5">
            <h3 className="text-[16px] font-semibold leading-none text-[#111827]">
              Order Details
            </h3>
          </div>
          <div className="space-y-8 p-5">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Request ID">
                <Input value={props.draftOrder.requestNumber} readOnly />
              </Field>
              <Field label="Request Date">
                <Input
                  value={formatDisplayDate(props.draftOrder.requestDate)}
                  readOnly
                />
              </Field>
              <Field label="Department">
                <Select
                  value={props.draftOrder.department}
                  onChange={(event) => {
                    props.onOrderChange("department", event.target.value);
                    props.onOrderChange("requestedApproverId", "");
                  }}
                >
                  {departmentOptions.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Required Delivery Date">
                <Input
                  value={props.draftOrder.deliveryDate}
                  onChange={(event) =>
                    props.onOrderChange("deliveryDate", event.target.value)
                  }
                  type="date"
                />
              </Field>
            </div>
            <OrderCreateItemsEditor
              goodsDrafts={props.goodsDrafts}
              canAddItems={props.canAddItems}
              draftItems={props.draftItems}
              onSelectCatalogProduct={props.onSelectCatalogProduct}
              onQuantityChange={props.onQuantityChange}
              onAddItem={props.onAddItem}
              onAddDraftRow={props.onAddDraftRow}
              onRemoveDraftRow={props.onRemoveDraftRow}
              onUpdateItemQuantity={props.onUpdateItemQuantity}
              onRemoveItem={props.onRemoveItem}
            />
          </div>
        </section>
        <OrderCreateSidebar
          draftOrder={props.draftOrder}
          draftItems={props.draftItems}
          summaryTotal={props.summaryTotal}
          permissionMessage={props.permissionMessage}
          canSubmitDraft={props.canSubmitDraft}
          missingSubmitFields={props.missingSubmitFields}
          onOrderChange={props.onOrderChange}
          onPermissionMessageChange={props.onPermissionMessageChange}
          onSubmit={props.onSubmit}
        />
      </div>
    </div>
  );
}
