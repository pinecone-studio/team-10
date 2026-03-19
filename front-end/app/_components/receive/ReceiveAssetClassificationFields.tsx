"use client";

import { useState } from "react";

type Props = {
  department: string;
  categoryOptions: string[];
  typeOptions: string[];
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onAddCategory: (value: string) => void;
  onAddType: (value: string) => void;
};

export function ReceiveAssetClassificationFields(props: Props) {
  const [isCategoryAdderOpen, setCategoryAdderOpen] = useState(false);
  const [isTypeAdderOpen, setTypeAdderOpen] = useState(false);
  const [categoryDraft, setCategoryDraft] = useState("");
  const [typeDraft, setTypeDraft] = useState("");

  return (
    <div className="rounded-[12px] border border-[#dbe3ee] bg-[#f8fbff] p-4">
      <p className="text-[12px] font-semibold text-[#0f172a]">
        Asset classification
      </p>
      <div className="mt-3 grid gap-3">
        <ReadOnlyField label="Department" value={props.department} />
        <SelectWithAdder
          label="Category"
          value={props.selectedCategory}
          options={props.categoryOptions}
          isAdderOpen={isCategoryAdderOpen}
          addValue={categoryDraft}
          addPlaceholder="Enter category"
          onChange={props.onCategoryChange}
          onToggleAdder={() => {
            setCategoryAdderOpen((current) => !current);
            setCategoryDraft("");
          }}
          onAddValueChange={setCategoryDraft}
          onAdd={() => {
            props.onAddCategory(categoryDraft);
            setCategoryDraft("");
            setCategoryAdderOpen(false);
          }}
        />
        <SelectWithAdder
          label="Type"
          value={props.selectedType}
          options={props.typeOptions}
          isAdderOpen={isTypeAdderOpen}
          addValue={typeDraft}
          addPlaceholder="Enter type"
          onChange={props.onTypeChange}
          onToggleAdder={() => {
            setTypeAdderOpen((current) => !current);
            setTypeDraft("");
          }}
          onAddValueChange={setTypeDraft}
          onAdd={() => {
            props.onAddType(typeDraft);
            setTypeDraft("");
            setTypeAdderOpen(false);
          }}
          disabled={!props.selectedCategory}
          helperText={
            !props.selectedCategory ? "Select category first." : undefined
          }
        />
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-[12px] font-medium text-[#344054]">
        {label}
      </span>
      {children}
    </label>
  );
}

function SelectWithAdder(props: {
  label: string;
  value: string;
  options: string[];
  isAdderOpen: boolean;
  addValue: string;
  addPlaceholder: string;
  onChange: (value: string) => void;
  onToggleAdder: () => void;
  onAddValueChange: (value: string) => void;
  onAdd: () => void;
  disabled?: boolean;
  helperText?: string;
}) {
  return (
    <div className="grid gap-2">
      <Field label={props.label}>
        <div className="flex gap-2">
          <select
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            disabled={props.disabled}
            className="h-[42px] w-full rounded-[10px] border border-[#d0d5dd] px-[12px] text-[12px] outline-none disabled:bg-[#f8fafc] disabled:text-[#98a2b3]"
          >
            <option value="">Select {props.label.toLowerCase()}</option>
            {props.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={props.onToggleAdder}
            disabled={props.disabled}
            className="inline-flex h-[42px] w-[42px] cursor-pointer items-center justify-center rounded-[10px] border border-[#d0d5dd] bg-white text-[16px] font-semibold text-[#2563eb] disabled:bg-[#f8fafc] disabled:text-[#98a2b3]"
          >
            +
          </button>
        </div>
      </Field>
      {props.helperText ? (
        <p className="text-[12px] text-[#64748b]">{props.helperText}</p>
      ) : null}
      {props.isAdderOpen ? (
        <div className="rounded-[10px] border border-[#cfe0ff] bg-white p-3 shadow-[0_10px_24px_rgba(148,163,184,0.12)]">
          <div className="flex gap-2">
            <input
              value={props.addValue}
              onChange={(event) => props.onAddValueChange(event.target.value)}
              placeholder={props.addPlaceholder}
              className="h-[38px] w-full rounded-[8px] border border-[#d0d5dd] px-[12px] text-[13px] outline-none"
            />
            <button
              type="button"
              onClick={props.onAdd}
              className="inline-flex h-[38px] cursor-pointer items-center justify-center rounded-[8px] bg-[#2563eb] px-3 text-[13px] font-medium text-white"
            >
              Add
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="mb-[6px] block text-[12px] font-medium text-[#344054]">
        {label}
      </p>
      <div className="flex h-[42px] items-center rounded-[10px] border border-[#d0d5dd] bg-white px-[12px] text-[12px] text-[#101828]">
        {value}
      </div>
    </div>
  );
}
