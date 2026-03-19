"use client";

import type { ReactNode } from "react";
import { ReceiveSpecificationFields } from "./ReceiveSpecificationFields";
import { ReceiveAssetClassificationFields } from "./ReceiveAssetClassificationFields";
import type { ReceiveSpecificationField } from "./receiveSpecifications";
import type { ReceiveCondition } from "./receiveTypes";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] font-medium text-[#344054]">
        {label}
      </span>
      {children}
    </label>
  );
}

export function ReceiveDetailFormCard(props: {
  receivedDate: string;
  receivedCondition: ReceiveCondition;
  quantityReceived: string;
  maxQuantity: number;
  receivedNote: string;
  department: string;
  categoryOptions: string[];
  typeOptions: string[];
  selectedCategory: string;
  selectedType: string;
  specificationFields: ReceiveSpecificationField[];
  suggestedSpecificationFields: string[];
  canSubmit: boolean;
  submitLabel: string;
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
    <div className="self-start flex h-[650px] flex-col overflow-hidden rounded-[12px] border border-[#dcdfe4] bg-white p-[18px] xl:sticky xl:top-6">
      <h3 className="text-[16px] font-semibold text-[#101828]">
        Receive Details
      </h3>
      <div className="mt-[14px] min-h-0 flex-1 space-y-[14px] overflow-y-auto pr-1">
        <div className="grid gap-[12px] sm:grid-cols-2">
          <Field label="Received date">
            <input
              value={props.receivedDate}
              onChange={(event) =>
                props.onReceivedDateChange(event.target.value)
              }
              type="date"
              className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[14px] outline-none"
            />
          </Field>
          <Field label="Condition on arrival">
            <select
              value={props.receivedCondition}
              onChange={(event) =>
                props.onReceivedConditionChange(
                  event.target.value as ReceiveCondition,
                )
              }
              className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[12px] outline-none"
            >
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="defective">Defective</option>
              <option value="missing">Missing</option>
            </select>
          </Field>
        </div>
        <Field label="Quantity received">
          <input
            value={props.quantityReceived}
            onChange={(event) =>
              props.onQuantityReceivedChange(event.target.value)
            }
            type="number"
            min="1"
            max={props.maxQuantity}
            className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[12px] outline-none"
          />
        </Field>
        <ReceiveAssetClassificationFields
          department={props.department}
          categoryOptions={props.categoryOptions}
          typeOptions={props.typeOptions}
          selectedCategory={props.selectedCategory}
          selectedType={props.selectedType}
          onCategoryChange={props.onCategoryChange}
          onTypeChange={props.onTypeChange}
          onAddCategory={props.onAddCategory}
          onAddType={props.onAddType}
        />
        <ReceiveSpecificationFields
          fields={props.specificationFields}
          suggestedFields={props.suggestedSpecificationFields}
          onFieldChange={props.onSpecificationChange}
          onAddField={props.onAddSpecificationField}
          onRemoveField={props.onRemoveSpecificationField}
        />
        <Field label="Notes">
          <textarea
            value={props.receivedNote}
            onChange={(event) => props.onReceivedNoteChange(event.target.value)}
            rows={3}
            className="w-full rounded-[10px] border border-[#d0d5dd] px-[12px] py-[10px] text-[12px] outline-none"
            placeholder="Add receive note..."
          />
        </Field>
        <button
          type="button"
          disabled={!props.canSubmit}
          onClick={() => void props.onSubmit()}
          className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#5d88ce] text-[14px] font-medium text-white transition duration-150 hover:bg-[#4c78c1] active:scale-[0.98] active:bg-[#436cae] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#bfdbfe] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#cbd5e1] disabled:text-white disabled:opacity-100"
        >
          <span className="fx-submit-icon-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fx-submit-icon"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </span>
          <span className="fx-submit-label">{props.submitLabel}</span>
        </button>
      </div>
    </div>
  );
}
