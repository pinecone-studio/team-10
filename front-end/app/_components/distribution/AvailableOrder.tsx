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
    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-2">
      {availableAssets.map((asset) => (
        <div
          key={asset.id}
          className="flex min-h-[121px] items-start justify-between rounded-[12px] border border-[#E2E8F0] bg-white px-3 py-6"
        >
          <div className="flex items-start gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#F1F5F9]">
              <LaptopIcon />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <p className="text-[14px] font-normal leading-5 text-[#0A0A0A]">
                  {asset.name}
                </p>
                <p className="text-[14px] font-normal leading-5 text-[#94A3B8]">
                  {asset.code}
                </p>
              </div>
              <div className="flex items-center gap-[14px]">
                <span className="inline-flex h-[17px] items-center justify-center rounded-[6px] bg-[#DBEAFE] px-[6px] text-[12px] leading-[15px] text-black">
                  {asset.category}
                </span>
                <span className="inline-flex h-[17px] items-center justify-center rounded-[6px] bg-[#DBEAFE] px-[6px] text-[12px] leading-[15px] text-black">
                  {asset.warehouse}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-[6px] bg-[#0F172A] px-4 text-[14px] font-medium leading-6 text-white"
          >
            Assign
          </button>
        </div>
      ))}
    </div>
  );
}
