import DeliveredIcon from "./icons/DeliveredIcon";
import PendingIcon from "./icons/PendingIcon";
import LaptopIcon from "./icons/LaptopIcon";
import RefreshIcon from "./icons/RefreshIcon";

const employeeRequests = [
  {
    id: 1,
    employee: "Battsetseg Ariunbyamba",
    item: "Monitor",
    description:
      "Need a second monitor for design work and video editing tasks.",
    requestedAt: "13/03/2026",
    status: "Pending Review",
  },
  {
    id: 2,
    employee: "Battsetseg Ariunbyamba",
    item: "Monitor",
    description:
      "Need a second monitor for design work and video editing tasks.",
    requestedAt: "13/03/2026",
    status: "Pending Review",
  },
  {
    id: 3,
    employee: "Battsetseg Ariunbyamba",
    item: "Monitor",
    description:
      "Need a second monitor for design work and video editing tasks.",
    requestedAt: "13/03/2026",
    status: "Approved",
  },
] as const;

function RequestStatusBadge(props: {
  status: (typeof employeeRequests)[number]["status"];
}) {
  if (props.status === "Approved") {
    return (
      <span className="inline-flex h-[22px] items-center gap-1 rounded-[8px] border border-[#A4F4CF] bg-[#D0FAE5] px-2 text-[12px] font-medium leading-4 text-[#006045]">
        <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
          <DeliveredIcon />
        </span>
        Approved
      </span>
    );
  }

  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-[8px] border border-[#FEE685] bg-[#FEF3C6] px-2 text-[12px] font-medium leading-4 text-[#973C00]">
      <span className="flex h-3 w-3 items-center justify-center [&_svg]:h-3 [&_svg]:w-3">
        <PendingIcon />
      </span>
      Pending Review
    </span>
  );
}

export default function EmployeeOrder() {
  return (
    <div className="flex w-full flex-col items-start gap-[10px]">
      {employeeRequests.map((request) => (
        <div
          key={request.id}
          className="flex w-full items-start justify-between rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-6"
        >
          <div className="flex flex-1 items-start gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#F1F5F9]">
              <LaptopIcon />
            </div>
            <div className="flex flex-1 flex-col gap-4">
              <div className="flex items-center gap-[6px]">
                <p className="text-[18px] font-semibold leading-7 text-[#0A0A0A]">
                  {request.employee}
                </p>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="flex flex-col gap-[6px]">
                <p className="text-[14px] font-normal leading-5 text-[#94A3B8]">
                  Requesting: {request.item}
                </p>
                <div className="flex flex-col gap-1">
                  <p className="text-[12px] font-normal leading-[15px] text-[#94A3B8]">
                    {request.description}
                  </p>
                  <p className="text-[12px] font-normal leading-[15px] text-[#94A3B8]">
                    Requested: {request.requestedAt}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-[#E2E8F0] bg-white"
          >
            <RefreshIcon />
          </button>
        </div>
      ))}
    </div>
  );
}
