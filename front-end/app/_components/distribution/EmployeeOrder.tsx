"use client";

import { useState } from "react";

import DeliveredIcon from "./icons/DeliveredIcon";
import PendingIcon from "./icons/PendingIcon";
import LaptopIcon from "./icons/LaptopIcon";

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
  const [notice, setNotice] = useState<string | null>(null);

  function handleAction(employee: string, action: "assign" | "dismiss") {
    setNotice(
      action === "assign"
        ? `${employee} request assigned successfully.`
        : `${employee} request dismissed successfully.`,
    );
  }

  return (
    <div className="flex w-full flex-col gap-4 px-6 pb-6">
      {notice ? (
        <div className="rounded-[12px] border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#166534]">
          {notice}
        </div>
      ) : null}
      {employeeRequests.map((request) => (
        <div
          key={request.id}
          className="flex w-full items-start justify-between gap-4 rounded-[14px] border border-[#E2E8F0] bg-white px-5 py-5"
        >
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#F1F5F9]">
              <LaptopIcon />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <div className="flex flex-wrap items-center gap-[6px]">
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
          <div className="flex shrink-0 items-center gap-2 self-end">
            <button
              type="button"
              onClick={() => handleAction(request.employee, "dismiss")}
              className="inline-flex h-10 items-center justify-center rounded-[8px] border border-[#E2E8F0] bg-white px-4 text-[14px] font-medium leading-6 text-[#334155] transition hover:bg-[#F8FAFC]"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => handleAction(request.employee, "assign")}
              className="inline-flex h-10 items-center justify-center rounded-[8px] bg-[#0F172A] px-4 text-[14px] font-medium leading-6 text-white transition hover:bg-[#1E293B]"
            >
              Assign
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
