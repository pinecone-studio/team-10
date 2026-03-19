"use client";

import { departmentOptions } from "../../_lib/order-catalog";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { CalendarIcon, ChevronDownIcon } from "./OrderCreateIcons";
import { Field, Input, Select } from "./OrderFormFields";
import { formatLongRequestDate } from "./orderCreateUtils";

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="flex h-9 items-center rounded-[6px] border border-[#e2e8f0] bg-white px-[13px] shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
        <span className="text-[14px] text-[#020618]">{value}</span>
      </div>
    </Field>
  );
}

export function OrderCreateDetailsCard(props: Pick<OrderCreateViewProps, "draftOrder" | "onOrderChange">) {
  return (
    <section className="rounded-[12px] border border-[#e2e8f0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]">
      <div className="border-b border-[#e2e8f0] bg-[rgba(241,245,249,0.3)] px-6 py-4">
        <h3 className="text-[16px] font-semibold leading-6 text-[#020618]">Order Details</h3>
      </div>
      <div className="grid gap-x-[52px] gap-y-5 px-6 py-6 md:grid-cols-2">
        <ReadonlyField label="Request ID" value={props.draftOrder.requestNumber} />
        <ReadonlyField label="Request Date" value={formatLongRequestDate(props.draftOrder.requestDate)} />
        <Field label="Department">
          <div className="relative">
            <Select
              value={props.draftOrder.department}
              onChange={(event) => props.onOrderChange("department", event.target.value)}
              className="appearance-none pr-10"
            >
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </Select>
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
              <ChevronDownIcon />
            </span>
          </div>
        </Field>
        <Field label="Required Delivery Date">
          <div className="relative">
            <Input
              value={props.draftOrder.deliveryDate}
              onChange={(event) => props.onOrderChange("deliveryDate", event.target.value)}
              type="date"
              className="pl-11 text-[#62748e]"
            />
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
              <CalendarIcon />
            </span>
          </div>
        </Field>
      </div>
    </section>
  );
}
