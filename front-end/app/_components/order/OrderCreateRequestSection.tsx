"use client";

import { departmentOptions } from "../../_lib/order-store";
import type { DepartmentOption } from "../../_lib/order-types";
import { ActionButton } from "../shared/WorkspacePrimitives";
import { InputField, SelectInput, TextInput } from "./OrderPrimitives";
import type { OrderCreateViewProps } from "./OrderCreateView.types";

type OrderCreateRequestSectionProps = Pick<
  OrderCreateViewProps,
  "draftOrder" | "onFillDemo" | "onOrderChange"
>;

export function OrderCreateRequestSection({
  draftOrder,
  onFillDemo,
  onOrderChange,
}: OrderCreateRequestSectionProps) {
  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[16px] py-[16px]">
      <div className="flex items-center justify-between border-b border-[#d2d2d6] pb-[14px]">
        <h3 className="text-[18px] font-semibold text-[#111111]">
          Create a new order
        </h3>
        <ActionButton variant="light" onClick={onFillDemo}>
          Demo data
        </ActionButton>
      </div>
      <div className="grid grid-cols-3  gap-[14px] pt-[12px]">
        <InputField label="Request number">
          <TextInput value={draftOrder.requestNumber} disabled />
        </InputField>
        <InputField label="Request date">
          <TextInput value={draftOrder.requestDate} disabled />
        </InputField>
        <InputField label="Department *">
          <SelectInput
            value={draftOrder.department}
            onChange={(event) =>
              onOrderChange(
                "department",
                event.target.value as DepartmentOption,
              )
            }
          >
            {departmentOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </SelectInput>
        </InputField>
        <InputField label="Requester *">
          <TextInput
            value={draftOrder.requester}
            onChange={(event) => onOrderChange("requester", event.target.value)}
            placeholder="Enter name"
          />
        </InputField>
        <InputField label="Delivery date *">
          <TextInput
            type="date"
            value={draftOrder.deliveryDate}
            onChange={(event) =>
              onOrderChange("deliveryDate", event.target.value)
            }
          />
        </InputField>
      </div>
    </section>
  );
}
