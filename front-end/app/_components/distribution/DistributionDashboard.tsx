import DeliveredIcon from "./icons/DeliveredIcon";
import PendingIcon from "./icons/PendingIcon";
import SignedIcon from "./icons/SignedIcon";
import TransitIcon from "./icons/TransitIcon";

export default function DistributionDashboard() {
  return (
    <div className="flex flex-col items-start self-stretch pt-6 pr-15 pb-6 pl-15 border-t border-slate-200 border-b  bg-white">
      <div className="flex justify-center items-start gap-4 self-stretch w-full">
        <div className="flex flex-col items-start flex-1 self-stretch px-4 py-10 rounded-[14px] border border-slate-200 bg-white w-full">
          <div className="flex items-center gap-4 self-stretch bg-white w-full">
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
        <div className="flex flex-col items-start flex-1 self-stretch px-4 py-10 rounded-[14px] border border-slate-200 bg-white w-full">
          <div className="flex items-center gap-4 self-stretch bg-white w-full">
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
        <div className="flex flex-col items-start flex-1 self-stretch px-4 py-10 rounded-[14px] border border-slate-200 bg-white w-full">
          <div className="flex items-center gap-4 self-stretch bg-white w-full">
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
        <div className="flex flex-col items-start flex-1 self-stretch px-4 py-10 rounded-[14px] border border-slate-200 bg-white w-full">
          <div className="flex items-center gap-4 self-stretch bg-white w-full">
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
