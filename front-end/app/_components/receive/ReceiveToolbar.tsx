"use client";

export function ReceiveToolbar({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="mt-[18px] flex flex-col gap-[12px] md:flex-row md:items-center md:justify-between">
      <label className="flex h-[40px] w-full max-w-[360px] items-center overflow-hidden rounded-[10px] border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search..."
          className="h-full flex-1 bg-transparent px-[12px] text-[15px] text-[#111111] outline-none placeholder:text-[#9ca3af]"
        />
        <span className="flex h-full w-[40px] items-center justify-center border-l border-[#e5e7eb] text-[#111111]">
          ⌕
        </span>
      </label>

      <button
        type="button"
        className="inline-flex h-[36px] items-center justify-center gap-[8px] self-start rounded-[10px] bg-[#171717] px-[14px] text-[14px] font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.14)]"
      >
        <span className="inline-flex size-[16px] items-center justify-center rounded-full border border-white/40 text-[12px]">
          +
        </span>
        <span>Quick Create</span>
      </button>
    </div>
  );
}
