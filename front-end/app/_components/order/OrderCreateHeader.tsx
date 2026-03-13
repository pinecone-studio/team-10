"use client";

export function OrderCreateHeader({
  actionLabel = "Order history",
  onAction,
}: {
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-[16px]">
      <div>
        <h2 className="text-[24px] font-semibold leading-[1.2] text-[#111111]">
          Inventory order
        </h2>
        <p className="mt-[2px] text-[14px] text-[#757575]">
          Create a new order and get approval.
        </p>
      </div>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex h-[36px] cursor-pointer items-center justify-center rounded-[8px] border border-[#d6d9de] bg-white px-[14px] text-[12px] font-medium text-[#1f2937]"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
