"use client";

import { departmentOptions } from "../../_lib/order-catalog";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import { CalendarIcon, CheckCircleIcon, ChevronDownIcon } from "./OrderCreateIcons";
import { Field, Input, Select } from "./OrderFormFields";
import { formatLongRequestDate } from "./orderCreateUtils";

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="flex h-12 items-center justify-between rounded-[10px] border border-[#e2e8f0] bg-[#f8fafc] px-4">
        <span className="text-[14px] text-[#0f172a]">{value}</span>
        <CheckCircleIcon />
      </div>
    </Field>
  );
}

export function OrderCreateDetailsCard(props: Pick<OrderCreateViewProps, "draftOrder" | "onOrderChange">) {
  return (
    <section className="rounded-[20px] border border-[#d9e0e8] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="border-b border-[#e8eef5] px-7 py-6">
        <h3 className="text-[18px] font-semibold text-[#0f172a]">Order Details</h3>
      </div>
      <div className="grid gap-x-14 gap-y-6 px-7 py-7 md:grid-cols-2">
        <ReadonlyField label="Request ID" value={props.draftOrder.requestNumber} />
        <ReadonlyField label="Request Date" value={formatLongRequestDate(props.draftOrder.requestDate)} />
        <Field label="Department">
          <div className="relative">
            <Select
              value={props.draftOrder.department}
              onChange={(event) => {
                props.onOrderChange("department", event.target.value);
                props.onOrderChange("requestedApproverId", "");
              }}
              className="appearance-none pr-10 text-[14px] text-[#64748b]"
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
              className="pl-11 text-[14px] text-[#64748b]"
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
