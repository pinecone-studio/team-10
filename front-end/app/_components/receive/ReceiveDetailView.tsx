"use client";

import type { ReceiveCondition, ReceiveRow } from "./receiveTypes";
import { ReceiveDetailFormCard } from "./ReceiveDetailFormCard";
import { ReceiveDetailPreviewCard } from "./ReceiveDetailPreviewCard";
import type { ReceiveSpecificationField } from "./receiveSpecifications";

export function ReceiveDetailView(props: {
  activeRow: ReceiveRow;
  activeProductImageUrl?: string | null;
  uploadedImage: string | null;
  completedItemsLabel: string;
  maxQuantity: number;
  receivedDate: string;
  receivedCondition: ReceiveCondition;
  quantityReceived: string;
  receivedNote: string;
  categoryOptions: string[];
  typeOptions: string[];
  selectedCategory: string;
  selectedType: string;
  specificationFields: ReceiveSpecificationField[];
  suggestedSpecificationFields: string[];
  onUploadImage: (file: File) => void;
  onReceivedDateChange: (value: string) => void;
  onReceivedConditionChange: (value: ReceiveCondition) => void;
  onQuantityReceivedChange: (value: string) => void;
  onReceivedNoteChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAddCategory: (value: string) => void;
  onAddType: (value: string) => void;
  onSpecificationChange: (id: string, value: string) => void;
  onAddSpecificationField: (name: string) => void;
  onRemoveSpecificationField: (id: string) => void;
  onSubmit: () => Promise<void>;
}) {
  return (
    <div className="grid gap-[18px] xl:grid-cols-[minmax(0,1.15fr)_390px]">
      <ReceiveDetailPreviewCard
        activeRow={props.activeRow}
        activeProductImageUrl={props.activeProductImageUrl}
        uploadedImage={props.uploadedImage}
        completedItemsLabel={props.completedItemsLabel}
        onUploadImage={props.onUploadImage}
      />
      <ReceiveDetailFormCard
        receivedDate={props.receivedDate}
        receivedCondition={props.receivedCondition}
        quantityReceived={props.quantityReceived}
        maxQuantity={props.maxQuantity}
        receivedNote={props.receivedNote}
        department={props.activeRow.department}
        categoryOptions={props.categoryOptions}
        typeOptions={props.typeOptions}
        selectedCategory={props.selectedCategory}
        selectedType={props.selectedType}
        specificationFields={props.specificationFields}
        suggestedSpecificationFields={props.suggestedSpecificationFields}
        canSubmit={
          props.activeRow.selectable &&
          Number(props.quantityReceived) > 0 &&
          Number(props.quantityReceived) <= props.maxQuantity
        }
        submitLabel={props.activeRow.selectable ? "Receive item" : "Already received"}
        onReceivedDateChange={props.onReceivedDateChange}
        onReceivedConditionChange={props.onReceivedConditionChange}
        onQuantityReceivedChange={props.onQuantityReceivedChange}
        onReceivedNoteChange={props.onReceivedNoteChange}
        onCategoryChange={props.onCategoryChange}
        onTypeChange={props.onTypeChange}
        onAddCategory={props.onAddCategory}
        onAddType={props.onAddType}
        onSpecificationChange={props.onSpecificationChange}
        onAddSpecificationField={props.onAddSpecificationField}
        onRemoveSpecificationField={props.onRemoveSpecificationField}
        onSubmit={props.onSubmit}
      />
    </div>
  );
}
