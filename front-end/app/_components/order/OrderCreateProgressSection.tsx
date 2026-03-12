"use client";

import {
  OrderCreateDocumentIcon,
  OrderCreatePermissionIcon,
  OrderCreateSubmitIcon,
  StepBadge,
} from "./OrderCreateIcons";

export function OrderCreateProgressSection() {
  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[24px] py-[22px]">
      <div className="mx-auto flex max-w-[645px] items-center justify-between">
        <StepBadge label="Create an order" icon={<OrderCreateDocumentIcon />} active />
        <div className="h-px w-[110px] bg-[#d0d0d3]" />
        <StepBadge
          label="Ask for permission"
          icon={<OrderCreatePermissionIcon />}
        />
        <div className="h-px w-[110px] bg-[#d0d0d3]" />
        <StepBadge label="Submit an order" icon={<OrderCreateSubmitIcon />} />
      </div>
    </section>
  );
}
