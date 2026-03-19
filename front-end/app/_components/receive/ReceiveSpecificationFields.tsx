"use client";

import { useState } from "react";
import type { ReceiveSpecificationField } from "./receiveSpecifications";

function Field(props: {
  field: ReceiveSpecificationField;
  onChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-[12px] border border-[#dbe4ee] bg-[#f8fbff] p-3">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[12px] font-semibold text-[#0f172a]">{props.field.name}</p>
        {props.field.removable ? (
          <button
            type="button"
            onClick={() => props.onRemove(props.field.id)}
            className="cursor-pointer text-[11px] font-medium text-[#dc2626]"
          >
            Remove
          </button>
        ) : null}
      </div>
      <input
        value={props.field.value}
        onChange={(event) => props.onChange(props.field.id, event.target.value)}
        placeholder={`Enter ${props.field.name.toLowerCase()}...`}
        className="h-[40px] w-full rounded-[10px] border border-[#d0d5dd] bg-white px-[12px] text-[13px] outline-none"
      />
    </div>
  );
}

export function ReceiveSpecificationFields(props: {
  fields: ReceiveSpecificationField[];
  suggestedFields?: string[];
  onFieldChange: (id: string, value: string) => void;
  onAddField: (name: string) => void;
  onRemoveField: (id: string) => void;
}) {
  const [customFieldName, setCustomFieldName] = useState("");

  return (
    <section className="rounded-[12px] border border-[#dbe4ee] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#101828]">Product details</p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            Only the most important fields are shown first. Add extra details only when needed.
          </p>
        </div>
        <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#35589c]">
          {props.fields.length} field{props.fields.length > 1 ? "s" : ""}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        {props.fields.map((field) => (
          <Field
            key={field.id}
            field={field}
            onChange={props.onFieldChange}
            onRemove={props.onRemoveField}
          />
        ))}
      </div>

      <div className="mt-4 rounded-[12px] border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-3">
        <p className="text-[12px] font-medium text-[#334155]">Add custom field</p>
        {props.suggestedFields && props.suggestedFields.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {props.suggestedFields.map((fieldName) => (
              <button
                key={fieldName}
                type="button"
                onClick={() => props.onAddField(fieldName)}
                className="cursor-pointer rounded-full border border-[#dbe4ee] bg-white px-3 py-1 text-[11px] font-medium text-[#35589c]"
              >
                + {fieldName}
              </button>
            ))}
          </div>
        ) : null}
        <div className="mt-2 flex gap-2">
          <input
            value={customFieldName}
            onChange={(event) => setCustomFieldName(event.target.value)}
            placeholder="Example: Fabric, Wheel type, Warranty..."
            className="h-[40px] min-w-0 flex-1 rounded-[10px] border border-[#d0d5dd] bg-white px-[12px] text-[13px] outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const nextName = customFieldName.trim();
              if (!nextName) return;
              props.onAddField(nextName);
              setCustomFieldName("");
            }}
            className="cursor-pointer rounded-[10px] border border-[#dbe4ee] bg-white px-4 text-[13px] font-medium text-[#0f172a]"
          >
            Add
          </button>
        </div>
      </div>
    </section>
  );
}
