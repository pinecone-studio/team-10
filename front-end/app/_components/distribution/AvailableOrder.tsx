import LaptopIcon from "./icons/LaptopIcon";

const availableAssets = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: 'MacBook Pro 14" M3',
  code: "MAC-2026-010",
  category: "Laptop",
  warehouse: "Warehouse A",
}));

export default function AvailableOrder() {
  return (
    <div className="grid w-full grid-cols-1 gap-4 px-6 pb-6 xl:grid-cols-2">
      {availableAssets.map((asset) => (
        <div
          key={asset.id}
          className="flex min-h-[140px] items-stretch justify-between rounded-[14px] border border-[#E2E8F0] bg-white px-5 py-5"
        >
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#F1F5F9]">
              <LaptopIcon />
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
              <div className="flex flex-col">
                <p className="truncate text-[15px] font-medium leading-6 text-[#0A0A0A]">
                  {asset.name}
                </p>
                <p className="text-[14px] font-normal leading-5 text-[#94A3B8]">
                  {asset.code}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-6 items-center justify-center rounded-[999px] bg-[#EFF6FF] px-2.5 text-[12px] leading-[15px] text-[#1D4ED8]">
                  {asset.category}
                </span>
                <span className="inline-flex h-6 items-center justify-center rounded-[999px] bg-[#F8FAFC] px-2.5 text-[12px] leading-[15px] text-[#475569]">
                  {asset.warehouse}
                </span>
              </div>
            </div>
          </div>
          <div className="ml-4 flex shrink-0 items-end">
            <button
              type="button"
              className="inline-flex h-10 min-w-[88px] items-center justify-center rounded-[8px] bg-[#0F172A] px-4 text-[14px] font-medium leading-6 text-white transition hover:bg-[#1E293B]"
            >
              Assign
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
