"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  fetchCensusPortalVerificationRequest,
  verifyCensusTaskByPortalRequest,
  type CensusTaskDto,
} from "@/app/(dashboard)/_graphql/census/census-api";

export function CensusPortalVerificationPage({ token }: { token: string }) {
  const [task, setTask] = useState<CensusTaskDto | null>(null);
  const [conditionStatus, setConditionStatus] = useState("good");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [previewMode, setPreviewMode] = useState<"mobile" | "desktop">("mobile");

  useEffect(() => {
    let live = true;
    void fetchCensusPortalVerificationRequest(token)
      .then((result) => {
        if (!live || !result) return;
        setTask(result);
        setConditionStatus(result.baselineConditionStatus);
      })
      .catch((cause) => {
        if (!live) return;
        setError(cause instanceof Error ? cause.message : "Failed to load verification task.");
      });
    return () => {
      live = false;
    };
  }, [token]);

  async function handleVerify() {
    try {
      const result = await verifyCensusTaskByPortalRequest({
        token,
        conditionStatus,
        note: note.trim() || null,
      });
      if (!result) return;
      setTask(result);
      setMessage("Asset possession confirmed successfully.");
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Verification failed.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#dcebfb_0%,#eff7ff_58%,#ffffff_100%)] px-4 py-8 text-slate-900">
      <section className={`${previewMode === "mobile" ? "max-w-[480px]" : "max-w-[860px]"} w-full rounded-[24px] border border-[#d7e4f2] bg-white p-6 shadow-[0_20px_48px_rgba(148,163,184,0.16)]`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#7c93b2]">Asset Census</p>
          <button
            type="button"
            onClick={() =>
              setPreviewMode((current) => (current === "mobile" ? "desktop" : "mobile"))
            }
            className="rounded-full border border-[#d5e5f5] bg-[#f8fbff] px-3 py-1.5 text-[12px] font-medium text-[#47627f]"
          >
            Switch to {previewMode === "mobile" ? "desktop" : "mobile"} view
          </button>
        </div>
        <h1 className="mt-3 text-[28px] font-semibold text-[#0f172a]">Employee Verification</h1>
        {error ? <p className="mt-4 rounded-[14px] bg-[#fef2f2] px-4 py-3 text-[14px] text-[#b91c1c]">{error}</p> : null}
        {message ? <p className="mt-4 rounded-[14px] bg-[#effdf3] px-4 py-3 text-[14px] text-[#15803d]">{message}</p> : null}
        {task ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-[18px] border border-[#d8e6f4] bg-[#f8fbff] p-4">
              <p className="text-[18px] font-semibold text-[#0f172a]">{task.assetName}</p>
              <p className="mt-1 text-[13px] text-[#64748b]">{task.assetCode} • {task.serialNumber ?? "No serial"}</p>
              <p className="mt-3 text-[13px] text-[#334155]">Assigned to {task.employeeName}</p>
              <p className="mt-1 text-[13px] text-[#334155]">Due {new Date(task.portalExpiresAt ?? task.createdAt).toLocaleString()}</p>
            </div>
            <label className="grid gap-2 text-[13px] text-[#334155]">
              <span>Current condition</span>
              <select value={conditionStatus} onChange={(event) => setConditionStatus(event.target.value)} className="h-11 rounded-[12px] border border-[#dbe4ee] bg-white px-3 text-[14px] outline-none">
                {["good", "fair", "damaged", "defective", "missing", "incomplete", "used"].map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-[13px] text-[#334155]">
              <span>Note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Optional note about the asset." className="rounded-[12px] border border-[#dbe4ee] bg-white px-3 py-3 text-[14px] outline-none" />
            </label>
            <button type="button" onClick={() => void handleVerify()} className="w-full rounded-[12px] bg-[#2563eb] px-4 py-3 text-[14px] font-semibold text-white">
              Confirm asset possession
            </button>
          </div>
        ) : error ? null : <p className="mt-4 text-[14px] text-[#52637a]">Loading verification task...</p>}
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-[14px] font-medium text-[#2563eb]">
          <span aria-hidden="true">{"<-"}</span>
          <span>Back to home</span>
        </Link>
      </section>
    </main>
  );
}
