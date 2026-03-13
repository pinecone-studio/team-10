"use client";

import {
  OrderCreateDocumentIcon,
  OrderCreatePermissionIcon,
  OrderCreateSubmitIcon,
  StepBadge,
} from "./OrderCreateIcons";

export function OrderCreateProgressSection() {
  return <OrderFlowProgressSection currentStep="create" />;
}

export function OrderFlowProgressSection({
  currentStep,
}: {
  currentStep: "create" | "permission" | "submit";
}) {
  const createState =
    currentStep === "create"
      ? "active"
      : "complete";
  const permissionState =
    currentStep === "permission"
      ? "active"
      : currentStep === "submit"
        ? "complete"
        : "inactive";
  const submitState = currentStep === "submit" ? "active" : "inactive";

  return (
    <section className="rounded-[10px] border border-[#d7d7da] bg-[#efefef] px-[24px] py-[22px]">
      <div className="mx-auto flex max-w-[645px] items-center justify-between">
        <StepBadge
          label="Create an order"
          icon={<OrderCreateDocumentIcon />}
          state={createState}
        />
        <div className="h-px w-[110px] bg-[#d0d0d3]" />
        <StepBadge
          label="Ask for permission"
          icon={<OrderCreatePermissionIcon />}
          state={permissionState}
        />
        <div className="h-px w-[110px] bg-[#d0d0d3]" />
        <StepBadge
          label="Submit an order"
          icon={<OrderCreateSubmitIcon />}
          state={submitState}
        />
      </div>
    </section>
  );
}
