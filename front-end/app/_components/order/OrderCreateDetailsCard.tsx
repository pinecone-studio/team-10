"use client";

import { departmentOptions } from "../../_lib/order-catalog";
import type { OrderCreateViewProps } from "./OrderCreateView.types";
import {
  CalendarIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from "./OrderCreateIcons";
import { Field, Input, Select } from "./OrderFormFields";
import { formatLongRequestDate } from "./orderCreateUtils";

function ReadonlyField({ label, value }: { label: string; value: string }) {
  return (
    <Field label={label}>
      <div className="flex h-11 items-center justify-between rounded-[10px] border border-[#d7e7fb] bg-[#f3f8ff] px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]">
        <span className="text-[14px] text-[#020618]">{value}</span>
        <CheckCircleIcon />
      </div>
    </Field>
  );
}

export function OrderCreateDetailsCard(
  props: Pick<OrderCreateViewProps, "draftOrder" | "onOrderChange">,
) {
  return (
    <section>
      <div className="px-8 py-6">
        <h3 className="text-[16px] font-semibold leading-7 text-[#111827]">
          Order Details
        </h3>
      </div>
      <div className="border-t border-[#dbeafb] px-8 pb-8 pt-8">
        <div className="grid gap-x-16 gap-y-5 md:grid-cols-2">
          <ReadonlyField
            label="Request ID"
            value={props.draftOrder.requestNumber}
          />
          <ReadonlyField
            label="Request Date"
            value={formatLongRequestDate(props.draftOrder.requestDate)}
          />
          <Field label="Department">
            <div className="relative">
              <Select
                value={props.draftOrder.department}
                onChange={(event) =>
                  props.onOrderChange("department", event.target.value)
                }
                className="h-11 appearance-none rounded-[10px] border-[#d7e7fb] bg-white pr-10 text-[#64748b]"
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
                onChange={(event) =>
                  props.onOrderChange("deliveryDate", event.target.value)
                }
                type="date"
                className="h-11 rounded-[10px] border-[#d7e7fb] pl-11 text-[#62748e]"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                <CalendarIcon />
              </span>
            </div>
          </Field>
        </div>
      </div>
    </section>
  );
}
