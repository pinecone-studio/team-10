import DeliveredIcon from "./icons/DeliveredIcon";
import PendingIcon from "./icons/PendingIcon";
import SignedIcon from "./icons/SignedIcon";
import TransitIcon from "./icons/TransitIcon";

export default function DistributionDashboard() {
  return (
    <div className="bg-white px-6 py-6">
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex min-h-[116px] w-full flex-col justify-center rounded-[14px] border border-slate-200 bg-white px-5 py-6">
          <div className="flex w-full items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-[10px] bg-orange-100">
              <PendingIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-[#0A0A0A] font-geist text-2xl font-bold leading-8">
                1
              </p>
              <p className="text-slate-400 font-geist text-sm font-normal leading-5">
                Pending
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-h-[116px] w-full flex-col justify-center rounded-[14px] border border-slate-200 bg-white px-5 py-6">
          <div className="flex w-full items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-[10px] bg-[#DBEAFE]">
              <TransitIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-[#0A0A0A] font-geist text-2xl font-bold leading-8">
                1
              </p>
              <p className="text-slate-400 font-geist text-sm font-normal leading-5">
                In Transit
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-h-[116px] w-full flex-col justify-center rounded-[14px] border border-slate-200 bg-white px-5 py-6">
          <div className="flex w-full items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-[10px] bg-[#DCFCE7]">
              <DeliveredIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-[#0A0A0A] font-geist text-2xl font-bold leading-8">
                1
              </p>
              <p className="text-slate-400 font-geist text-sm font-normal leading-5">
                Delivered
              </p>
            </div>
          </div>
        </div>
        <div className="flex min-h-[116px] w-full flex-col justify-center rounded-[14px] border border-slate-200 bg-white px-5 py-6">
          <div className="flex w-full items-center gap-4">
            <div className="flex w-12 h-12 justify-center items-center rounded-[10px] bg-[#F3E8FF]">
              <SignedIcon />
            </div>
            <div className="flex flex-col">
              <p className="text-[#0A0A0A] font-geist text-2xl font-bold leading-8">
                1
              </p>
              <p className="text-slate-400 font-geist text-sm font-normal leading-5">
                Signed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
