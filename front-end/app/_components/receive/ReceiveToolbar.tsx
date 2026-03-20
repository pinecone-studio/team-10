"use client";

export function ReceiveToolbar({
  search,
  onSearchChange,
  onQuickCreate,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onQuickCreate: () => void | Promise<void>;
}) {
  return (
    <div className="mt-[8px] flex items-center justify-between gap-[16px]">
      <label className="receive-search-field flex h-[40px] w-full max-w-[248px] items-center overflow-hidden rounded-[10px] border border-transparent bg-[#f3f3f3] px-0">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search..."
          className="h-full flex-1 !border-0 !bg-transparent !shadow-none px-[14px] text-[14px] text-[#101828] outline-none placeholder:text-[#98a2b3]"
        />
        <span className="flex h-full w-[40px] items-center justify-center border-l border-[#dbe4f0] text-[#344054]">
          ⌕
        </span>
      </label>

      <button
        type="button"
        onClick={() => void onQuickCreate()}
        className="inline-flex h-[32px] cursor-pointer items-center gap-[6px] rounded-[10px] bg-[#101828] px-[12px] text-[14px] font-medium text-white"
      >
        <span className="inline-flex size-[16px] items-center justify-center rounded-full border border-white/20 text-[12px] leading-none">
          +
        </span>
        <span>Quick Create</span>
      </button>
    </div>
  );
}
