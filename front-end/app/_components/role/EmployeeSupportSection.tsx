"use client";

import { useMemo, useState } from "react";

import { formatDisplayDate, useOrdersStore } from "../../_lib/order-store";
import { WorkspaceShell } from "../shared/WorkspacePrimitives";

type SupportMode = "issue" | "swap";

export function EmployeeSupportSection() {
  const orders = useOrdersStore();
  const assignedAssets = useMemo(
    () =>
      orders
        .filter((order) => order.status === "assigned_hr")
        .flatMap((order) =>
          order.items.map((item, index) => ({
            id: `${order.id}-${item.catalogId}-${index}`,
            name: item.name,
            assignedAt: order.assignedAt?.slice(0, 10) ?? order.requestDate,
          })),
        ),
    [orders],
  );

  const [mode, setMode] = useState<SupportMode>("issue");
  const [assetId, setAssetId] = useState(assignedAssets[0]?.id ?? "");
  const [notes, setNotes] = useState("");
  const [notice, setNotice] = useState<string | null>(null);

  const selectedAsset = assignedAssets.find((item) => item.id === assetId);

  return (
    <WorkspaceShell
      title="Asset support"
      subtitle="Report a problem or ask for a replacement for one of your assets."
    >
      {notice ? (
        <div className="mb-4 rounded-[14px] border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#166534]">
          {notice}
        </div>
      ) : null}
      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-6 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
        <div className="grid grid-cols-2 gap-2 rounded-[14px] bg-[#F1F5F9] p-1">
          <button
            type="button"
            onClick={() => setMode("issue")}
            className={`rounded-[10px] px-3 py-2 text-[13px] font-medium transition ${mode === "issue" ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]" : "text-[#64748B]"}`}
          >
            Report issue
          </button>
          <button
            type="button"
            onClick={() => setMode("swap")}
            className={`rounded-[10px] px-3 py-2 text-[13px] font-medium transition ${mode === "swap" ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(15,23,42,0.06)]" : "text-[#64748B]"}`}
          >
            Request swap
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="flex flex-col gap-2 text-[13px] font-medium text-[#334155]">
            <span>Asset</span>
            <select
              value={assetId}
              onChange={(event) => setAssetId(event.target.value)}
              className="h-11 rounded-[12px] border border-[#D8E1EE] bg-white px-3 text-[14px] text-[#0F172A] outline-none"
            >
              {assignedAssets.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-[13px] font-medium text-[#334155]">
            <span>{mode === "swap" ? "Why do you need a replacement?" : "What is the problem?"}</span>
            <textarea
              rows={6}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={mode === "swap" ? "Explain why you need a replacement." : "Describe the issue with this asset."}
              className="rounded-[14px] border border-[#D8E1EE] bg-white px-4 py-3 text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
            />
          </label>

          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#64748B]">Selected asset</p>
            <p className="mt-2 text-[15px] font-semibold text-[#0F172A]">{selectedAsset?.name ?? "No asset selected"}</p>
            <p className="mt-1 text-[13px] text-[#64748B]">
              {selectedAsset ? `Assigned on ${formatDisplayDate(selectedAsset.assignedAt)}` : "Choose one of your assigned assets."}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                if (!selectedAsset) return;
                setNotice(
                  mode === "swap"
                    ? `Swap request sent for ${selectedAsset.name}.`
                    : `Issue report sent for ${selectedAsset.name}.`,
                );
                setNotes("");
              }}
              className={`inline-flex h-11 items-center justify-center rounded-[12px] px-5 text-[14px] font-medium text-white transition ${mode === "swap" ? "bg-[#2563EB] hover:bg-[#1D4ED8]" : "bg-[#DC2626] hover:bg-[#B91C1C]"}`}
            >
              {mode === "swap" ? "Send swap request" : "Send issue report"}
            </button>
          </div>
        </div>
      </div>
    </WorkspaceShell>
  );
}
