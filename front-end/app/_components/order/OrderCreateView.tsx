"use client";

import { departmentOptions, formatCurrency, goodsCatalog } from "../../_lib/order-store";
import type { DepartmentOption, OrderItem } from "../../_lib/order-types";
import { ActionButton } from "../shared/WorkspacePrimitives";
import { InputField, SectionCard, SelectInput, TextInput } from "./OrderPrimitives";
import type { DraftOrder, GoodsDraft } from "./orderHelpers";

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
  const { draftOrder, goodsDrafts, draftItems, canAddItems, canSubmitDraft, summaryTotal } = props;

  return (
    <>
      <SectionCard title="Create a new order" icon={<span>[ ]</span>} trailing={<ActionButton variant="light" onClick={props.onFillDemo}>Demo data</ActionButton>}>
        <div className="grid grid-cols-3 gap-[12px]">
          <InputField label="Request number"><TextInput value={draftOrder.requestNumber} disabled /></InputField>
          <InputField label="Request date"><TextInput value={draftOrder.requestDate} disabled /></InputField>
          <InputField label="Department *"><SelectInput value={draftOrder.department} onChange={(event) => props.onOrderChange("department", event.target.value as DepartmentOption)}>{departmentOptions.map((option) => <option key={option} value={option}>{option}</option>)}</SelectInput></InputField>
          <InputField label="Requester *"><TextInput value={draftOrder.requester} onChange={(event) => props.onOrderChange("requester", event.target.value)} placeholder="Enter name" /></InputField>
          <InputField label="Delivery date *"><TextInput type="date" value={draftOrder.deliveryDate} onChange={(event) => props.onOrderChange("deliveryDate", event.target.value)} /></InputField>
        </div>
      </SectionCard>

      <SectionCard title="Custom goods" icon={<span>+</span>} trailing={<span className="text-[11px] text-[#8fa0ba]">{draftItems.length} item</span>}>
        <div className="rounded-[10px] bg-[#f1f1f2] px-[10px] py-[10px]">
          <div className="space-y-[12px]">
            {goodsDrafts.map((goodsDraft, index) => (
              <div key={goodsDraft.id} className="rounded-[10px] bg-white/45 px-[10px] py-[10px]">
                <div className="grid grid-cols-[1.7fr_0.65fr_0.8fr_auto] gap-[10px]">
                  <InputField label={`Select goods${goodsDrafts.length > 1 ? ` ${index + 1}` : ""}`}><TextInput value={goodsDraft.search} onChange={(event) => props.onGoodsChange(goodsDraft.id, event.target.value)} placeholder="Search by goods name or code" /></InputField>
                  <InputField label="Quantity"><TextInput type="number" value={goodsDraft.quantity} onChange={(event) => props.onQuantityChange(goodsDraft.id, event.target.value)} /></InputField>
                  <InputField label="Unit price"><TextInput type="number" value={goodsDraft.unitPrice} onChange={(event) => props.onUnitPriceChange(goodsDraft.id, event.target.value)} /></InputField>
                  <div className="flex items-end gap-[6px]">
                    <ActionButton variant="light" onClick={() => props.onAddItem(goodsDraft.id)} disabled={!canAddItems[index]}>+ Add</ActionButton>
                    <button type="button" onClick={props.onAddDraftRow} className="inline-flex h-[34px] items-center justify-center rounded-[7px] border border-[#d7d7d7] bg-white px-[10px] text-[10px] font-medium text-[#4a4a4a]">+ Row</button>
                    {goodsDrafts.length > 1 ? <button type="button" onClick={() => props.onRemoveDraftRow(goodsDraft.id)} className="inline-flex h-[34px] items-center justify-center rounded-[7px] border border-[#e1d2d2] bg-[#fff7f7] px-[10px] text-[10px] font-medium text-[#9a5d5d]">Remove</button> : null}
                  </div>
                </div>
                <div className="mt-[10px] flex flex-wrap gap-[8px]">
                  {goodsCatalog.map((item) => <button key={`${goodsDraft.id}-${item.id}`} type="button" onClick={() => props.onSelectSuggestion(goodsDraft.id, item.id)} className="rounded-full border border-[#dddddd] bg-white px-[10px] py-[5px] text-[10px] text-[#5e5e5e]">{item.name}</button>)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-[18px]">
          {draftItems.length > 0 ? (
            <>
              <div className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr_0.45fr] gap-[12px] px-[10px] text-[10px] text-[#8a8a8a]"><span>Product name</span><span>Code</span><span>Quantity</span><span>Unit</span><span>Unit price</span><span>Total</span><span /></div>
              <div className="mt-[10px] space-y-[8px]">
                {draftItems.map((item, index) => <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.8fr_0.8fr_0.45fr] items-center gap-[12px] rounded-[8px] border border-[#ececec] px-[10px] py-[10px] text-[12px]"><span>{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{item.unit}</span><span>{formatCurrency(item.unitPrice)}</span><span>{formatCurrency(item.totalPrice)}</span><button type="button" onClick={() => props.onRemoveItem(index)}>x</button></div>)}
              </div>
            </>
          ) : <div className="flex min-h-[140px] flex-col items-center justify-center text-center text-[#8e8e8e]"><div className="text-[34px]">[ ]</div><p className="mt-[10px] text-[12px]">The item has not been added.</p><p className="text-[12px]">Please select goods and add them above.</p></div>}
        </div>
      </SectionCard>

      <div className="flex justify-between">
        <div className="rounded-[8px] bg-[#f1f1f2] px-[14px] py-[12px] text-[12px] font-semibold text-[#171717]">Total: {formatCurrency(summaryTotal)}</div>
        <ActionButton onClick={props.onSubmit} disabled={!canSubmitDraft}>Submit for approval</ActionButton>
      </div>
    </>
  );
}
