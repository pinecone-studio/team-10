import CallendarIcon from "./icons/CallendarIcon";
import DeliveredIcon from "./icons/DeliveredIcon";
import EyeIcon from "./icons/EyeIcon";
import PendingIcon from "./icons/PendingIcon";
import SignedIcon from "./icons/SignedIcon";
import TransitIcon from "./icons/TransitIcon";

const distributionRows = [
  {
    id: "0260313-001",
    recipient: "Ganbold Batjargal",
    initials: "GB",
    department: "Engineering",
    location: "Building A, Floor 3",
    items: "2 items",
    date: "2026-03-13",
    status: "Delivered",
  },
  {
    id: "0260312-003",
    recipient: "Oyungerel Bold",
    initials: "OB",
    department: "Finance",
    location: "Building B, Floor 2",
    items: "2 items",
    date: "2026-03-12",
    status: "Signed",
  },
  {
    id: "0260311-005",
    recipient: "Bat Erdene",
    initials: "BE",
    department: "Operations",
    location: "Building A, Floor 1",
    items: "1 item",
    date: "2026-03-11",
    status: "In Transit",
  },
  {
    id: "0260310-002",
    recipient: "Tsolmon Sukhbaatar",
    initials: "TS",
    department: "HR",
    location: "Building B, Floor 1",
    items: "2 items",
    date: "2026-03-10",
    status: "Pending",
  },
] as const;

function StatusBadge(props: {
  status: (typeof distributionRows)[number]["status"];
}) {
  if (props.status === "Delivered") {
    return (
      <span className="inline-flex h-[38px] items-center gap-1 rounded-[14px] border border-[#A4F4CF] bg-[#D0FAE5] px-4 text-[12px] font-medium leading-4 text-[#006045]">
        <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
          <DeliveredIcon />
        </span>
        Delivered
      </span>
    );
  }

  if (props.status === "Signed") {
    return (
      <span className="inline-flex h-[38px] items-center gap-1 rounded-[14px] border border-[#E9D4FF] bg-[#F3E8FF] px-4 text-[12px] font-medium leading-4 text-[#6E11B0]">
        <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
          <SignedIcon />
        </span>
        Signed
      </span>
    );
  }

  if (props.status === "In Transit") {
    return (
      <span className="inline-flex h-[38px] items-center gap-1 rounded-[14px] border border-[#BEDBFF] bg-[#DBEAFE] px-4 text-[12px] font-medium leading-4 text-[#193CB8]">
        <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
          <TransitIcon />
        </span>
        In Transit
      </span>
    );
  }

  return (
    <span className="inline-flex h-[38px] items-center gap-1 rounded-[14px] border border-[#FEE685] bg-[#FEF3C6] px-4 text-[12px] font-medium leading-4 text-[#973C00]">
      <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
        <PendingIcon />
      </span>
      Pending
    </span>
  );
}

export default function DistributionOrder() {
  return (
    <div className="px-6 pb-6">
      <div className="w-full rounded-[14px] border border-[#E2E8F0] bg-white p-5">
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1051px]">
            <div className="grid grid-cols-[1.5fr_2.4fr_1.3fr_1.6fr_0.9fr_1.2fr_1.3fr_0.7fr] border-b border-[#E5E7EB]">
              {[
                "Distribution #",
                "Recipient",
                "Department",
                "Location",
                "Items",
                "Date",
                "Status",
                "Actions",
              ].map((heading, index) => (
                <div
                  key={heading}
                  className={`px-4 py-4 text-[14px] font-medium leading-5 text-[#0A0A0A] ${index === 7 ? "text-right" : ""}`}
                >
                  {heading}
                </div>
              ))}
            </div>
            <div className="flex flex-col">
              {distributionRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1.5fr_2.4fr_1.3fr_1.6fr_0.9fr_1.2fr_1.3fr_0.7fr] items-center border-b border-[#E5E7EB] last:border-b-0"
                >
                  <div className="px-4 py-4 font-mono text-[14px] font-medium leading-5 text-[#0A0A0A]">
                    {row.id}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-4">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F5] text-[12px] font-normal leading-4 text-[#0A0A0A]">
                      {row.initials}
                    </div>
                    <span className="text-[14px] font-normal leading-5 text-[#0A0A0A]">
                      {row.recipient}
                    </span>
                  </div>
                  <div className="px-4 py-4 text-[14px] font-normal leading-5 text-[#737373]">
                    {row.department}
                  </div>
                  <div className="px-4 py-4 text-[14px] font-normal leading-5 text-[#737373]">
                    {row.location}
                  </div>
                  <div className="px-4 py-4 text-[14px] font-normal leading-5 text-[#0A0A0A]">
                    {row.items}
                  </div>
                  <div className="flex items-center gap-1 px-4 py-4 text-[14px] font-normal leading-5 text-[#0A0A0A]">
                    <CallendarIcon />
                    <span>{row.date}</span>
                  </div>
                  <div className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="flex justify-end px-4 py-4">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-transparent text-[#0A0A0A] transition hover:border-[#E2E8F0] hover:bg-[#F8FAFC]"
                    >
                      <EyeIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
