"use client";

import { departmentOptions, formatCurrency, goodsCatalog } from "../../_lib/order-store";
import type { DepartmentOption, OrderItem } from "../../_lib/order-types";
import { ActionButton } from "../shared/WorkspacePrimitives";
import { InputField, SelectInput, TextInput } from "./OrderPrimitives";
import type { DraftOrder, GoodsDraft } from "./orderHelpers";

function CubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[60px] w-[60px] text-[#c7c8cc]" aria-hidden="true">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Zm0 0v18m8-13.5-8 4.5-8-4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-[16px] w-[16px]" aria-hidden="true">
      <path d="m3.2 8.2 3 3L12.8 4.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StepBadge({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-[9px]">
      <div className={`flex h-[40px] w-[40px] items-center justify-center rounded-full border ${active ? "border-black bg-black text-white" : "border-[#a8a8aa] bg-transparent text-[#8f8f8f]"}`}>
        {active ? <CheckIcon /> : null}
      </div>
      <span className="text-[14px] text-[#7c7c7c]">{label}</span>
    </div>
  );
}

export function OrderCreateView(props: {
  draftOrder: DraftOrder;
  goodsDrafts: GoodsDraft[];
  draftItems: OrderItem[];
  canAddItems: boolean[];
  canSubmitDraft: boolean;
  summaryTotal: number;
  onFillDemo: () => void;
  onOrderChange: <Key extends keyof DraftOrder>(key: Key, value: DraftOrder[Key]) => void;
  onGoodsChange: (draftId: string, value: string) => void;
  onQuantityChange: (draftId: string, value: string) => void;
  onUnitPriceChange: (draftId: string, value: string) => void;
  onSelectSuggestion: (draftId: string, itemId: string) => void;
  onAddItem: (draftId: string) => void;
  onAddDraftRow: () => void;
  onRemoveDraftRow: (draftId: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmit: () => void;
}) {
  const { draftOrder, goodsDrafts, draftItems, canAddItems } = props;

  return (
    <>
      <div>
        <h2 className="text-[32px] font-semibold leading-[1.2] text-[#111111]">Inventory order</h2>
        <p className="mt-[2px] text-[15px] text-[#757575]">Create a new order and get approval.</p>
      </div>

      <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[24px] py-[22px]">
        <div className="mx-auto flex max-w-[645px] items-center justify-between">
          <StepBadge label="Create an order" active />
          <div className="h-px w-[110px] bg-[#d0d0d3]" />
          <StepBadge label="Ask for permission" />
          <div className="h-px w-[110px] bg-[#d0d0d3]" />
          <StepBadge label="Submit an order" />
        </div>
      </section>

      <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
        <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[14px]">
          <h3 className="text-[24px] font-semibold text-[#111111]">Create a new order</h3>
          <ActionButton variant="light" onClick={props.onFillDemo}>Demo data</ActionButton>
        </div>
        <div className="grid grid-cols-3 gap-[14px] pt-[14px]">
          <InputField label="Request number"><TextInput value={draftOrder.requestNumber} disabled /></InputField>
          <InputField label="Request date"><TextInput value={draftOrder.requestDate} disabled /></InputField>
          <InputField label="Department *"><SelectInput value={draftOrder.department} onChange={(event) => props.onOrderChange("department", event.target.value as DepartmentOption)}>{departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</SelectInput></InputField>
          <InputField label="Requester *"><TextInput value={draftOrder.requester} onChange={(event) => props.onOrderChange("requester", event.target.value)} placeholder="Enter name" /></InputField>
          <InputField label="Delivery date *"><TextInput type="date" value={draftOrder.deliveryDate} onChange={(event) => props.onOrderChange("deliveryDate", event.target.value)} /></InputField>
        </div>
      </section>

      <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
        <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[14px]">
          <h3 className="text-[24px] font-semibold text-[#111111]">Custom goods</h3>
          <span className="text-[13px] text-[#8f8f8f]">{draftItems.length} item</span>
        </div>

        <div className="mt-[14px] rounded-[6px] border border-[#d6d6da] bg-[#dcdde0] px-[10px] py-[10px]">
          {goodsDrafts.map((goodsDraft, index) => (
            <div key={goodsDraft.id} className="grid grid-cols-[1.3fr_0.35fr_0.4fr_auto] items-end gap-[10px]">
              <InputField label={`Select goods${goodsDrafts.length > 1 ? ` ${index + 1}` : ""}`}>
                <SelectInput value={goodsDraft.selectedItem?.id ?? ""} onChange={(event) => props.onSelectSuggestion(goodsDraft.id, event.target.value)}>
                  <option value="">Search for goods...</option>
                  {goodsCatalog.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </SelectInput>
              </InputField>
              <InputField label="Quantity"><TextInput type="number" value={goodsDraft.quantity} onChange={(event) => props.onQuantityChange(goodsDraft.id, event.target.value)} /></InputField>
              <InputField label="Unit price"><TextInput type="number" value={goodsDraft.unitPrice} onChange={(event) => props.onUnitPriceChange(goodsDraft.id, event.target.value)} /></InputField>
              <div className="flex gap-[8px]">
                <button type="button" onClick={() => props.onAddItem(goodsDraft.id)} disabled={!canAddItems[index]} className="inline-flex h-[31px] items-center justify-center rounded-[6px] bg-[#9ea0a6] px-[20px] text-[13px] font-medium text-white disabled:opacity-50">+ Add</button>
                {index === goodsDrafts.length - 1 ? <button type="button" onClick={props.onAddDraftRow} className="inline-flex h-[31px] items-center justify-center rounded-[6px] border border-[#b5b8bf] bg-[#ececef] px-[14px] text-[13px]">+ Row</button> : null}
                {goodsDrafts.length > 1 ? <button type="button" onClick={() => props.onRemoveDraftRow(goodsDraft.id)} className="inline-flex h-[31px] items-center justify-center rounded-[6px] border border-[#d5b0af] bg-[#f6ebeb] px-[14px] text-[13px] text-[#9d5d5d]">Remove</button> : null}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[20px]">
          {draftItems.length > 0 ? (
            <>
              <div className="grid grid-cols-[1.2fr_0.8fr_0.65fr_0.65fr_0.8fr_0.8fr_0.4fr] gap-[12px] border-b border-[#d4d4d8] pb-[10px] text-[13px] text-[#7a7a7a]">
                <span>Product name</span><span>Code</span><span>Quantity</span><span>Unit</span><span>Unit price</span><span>Total</span><span />
              </div>
              <div className="mt-[10px] space-y-[8px]">
                {draftItems.map((item, index) => (
                  <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.65fr_0.65fr_0.8fr_0.8fr_0.4fr] items-center gap-[12px] rounded-[6px] border border-[#d7d7da] px-[12px] py-[11px] text-[15px]">
                    <span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{item.unit}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span><button type="button" onClick={() => props.onRemoveItem(index)} className="text-[#6d6d6d]">×</button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex min-h-[165px] flex-col items-center justify-center text-center text-[#888888]">
              <CubeIcon />
              <p className="mt-[12px] text-[18px] leading-[1.25]">The item has not been added.</p>
              <p className="text-[18px] leading-[1.25]">Please select and add items from the form above.</p>
            </div>
          )}
        </div>
      </section>

      <div className="flex justify-end pt-[2px]">
        <button
          type="button"
          onClick={props.onSubmit}
          disabled={!props.canSubmitDraft}
          className="inline-flex h-[41px] items-center justify-center gap-[10px] rounded-[6px] bg-black px-[24px] text-[15px] font-medium text-white disabled:opacity-50"
        >
          Submit for approval
          <span aria-hidden="true">›</span>
        </button>
      </div>
    </>
  );
}
