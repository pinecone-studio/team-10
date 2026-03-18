import DeliveredIcon from "./icons/DeliveredIcon";
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

function CalendarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="h-[14px] w-[14px]"
    >
      <path
        d="M4.66667 1.16666V3.49999"
        stroke="#737373"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.33333 1.16666V3.49999"
        stroke="#737373"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.75 5.83334H12.25"
        stroke="#737373"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2.33333 2.33334H11.6667C12.311 2.33334 12.8333 2.85567 12.8333 3.50001V11.6667C12.8333 12.311 12.311 12.8333 11.6667 12.8333H2.33333C1.68899 12.8333 1.16666 12.311 1.16666 11.6667V3.50001C1.16666 2.85567 1.68899 2.33334 2.33333 2.33334Z"
        stroke="#737373"
        strokeWidth="1.16667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className="h-4 w-4"
    >
      <path
        d="M1.33334 8C2.22207 5.17189 4.85457 3.33334 8.00001 3.33334C11.1454 3.33334 13.7779 5.17189 14.6667 8C13.7779 10.8281 11.1454 12.6667 8.00001 12.6667C4.85457 12.6667 2.22207 10.8281 1.33334 8Z"
        stroke="#0A0A0A"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 9.66666C8.92047 9.66666 9.66667 8.92047 9.66667 7.99999C9.66667 7.07952 8.92047 6.33333 8 6.33333C7.07953 6.33333 6.33333 7.07952 6.33333 7.99999C6.33333 8.92047 7.07953 9.66666 8 9.66666Z"
        stroke="#0A0A0A"
        strokeWidth="1.33333"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusBadge(props: { status: (typeof distributionRows)[number]["status"] }) {
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
    <div className="flex w-full flex-col items-start rounded-[12px] border border-[#E2E8F0] bg-white px-4 py-6">
      <div className="flex w-full flex-col items-start rounded-[14px] border border-[#E5E5E5] bg-white px-0 pt-4 pb-6">
        <div className="w-full overflow-x-auto px-6">
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
                  className={`px-4 py-[18px] text-[14px] font-medium leading-5 text-[#0A0A0A] ${index === 7 ? "text-right" : ""}`}
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
                  <div className="px-4 py-5 font-mono text-[14px] font-medium leading-5 text-[#0A0A0A]">
                    {row.id}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-[18px]">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F5F5F5] text-[12px] font-normal leading-4 text-[#0A0A0A]">
                      {row.initials}
                    </div>
                    <span className="text-[14px] font-normal leading-5 text-[#0A0A0A]">
                      {row.recipient}
                    </span>
                  </div>
                  <div className="px-4 py-5 text-[14px] font-normal leading-5 text-[#737373]">
                    {row.department}
                  </div>
                  <div className="px-4 py-5 text-[14px] font-normal leading-5 text-[#737373]">
                    {row.location}
                  </div>
                  <div className="px-4 py-5 text-[14px] font-normal leading-5 text-[#0A0A0A]">
                    {row.items}
                  </div>
                  <div className="flex items-center gap-1 px-4 py-5 text-[14px] font-normal leading-5 text-[#0A0A0A]">
                    <CalendarIcon />
                    <span>{row.date}</span>
                  </div>
                  <div className="px-4 py-[11px]">
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="flex justify-end px-4 py-5">
                    <button
                      type="button"
                      className="inline-flex h-8 w-8 items-center justify-center text-[#0A0A0A]"
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
