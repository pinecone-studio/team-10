"use client";

import { useState } from "react";

import { WorkspaceShell } from "../shared/WorkspacePrimitives";

const requestableAssets = [
  "Dell 27 Monitor",
  "Magic Keyboard",
  "Lenovo Dock Gen 2",
  "Access Card Replacement",
] as const;

export function EmployeeRequestsSection() {
  const [asset, setAsset] = useState<(typeof requestableAssets)[number]>(
    requestableAssets[0],
  );
  const [reason, setReason] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  return (
    <WorkspaceShell
      title="Asset requests"
      subtitle="Request an additional item from storage when you need it."
    >
      {notice ? (
        <div className="mb-4 rounded-[14px] border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#166534]">
          {notice}
        </div>
      ) : null}
      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="grid gap-4">
          <label className="flex flex-col gap-2 text-[13px] font-medium text-[#334155]">
            <span>Asset</span>
            <select
              value={asset}
              onChange={(event) => setAsset(event.target.value as (typeof requestableAssets)[number])}
              className="h-11 rounded-[12px] border border-[#D8E1EE] bg-white px-3 text-[14px] text-[#0F172A] outline-none"
            >
              {requestableAssets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-medium text-[#334155]">
            <span>Reason</span>
            <textarea
              rows={6}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Describe why you need this asset."
              className="rounded-[14px] border border-[#D8E1EE] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
          </label>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setNotice(`${asset} request submitted successfully.`);
                setReason("");
              }}
              className="inline-flex h-11 items-center justify-center rounded-[12px] bg-[#0F172A] px-5 text-[14px] font-medium text-white transition hover:bg-[#1E293B]"
            >
              Submit request
            </button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
