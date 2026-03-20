"use client";

import { useState } from "react";
import type { DistributionRecordDto } from "@/app/(dashboard)/_graphql/distribution/distribution-api";

type ModalState = { row: DistributionRecordDto; reason: string } | null;

export default function EmployeeOrder(props: { rows: DistributionRecordDto[] }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);

  function closeModal() { setModal(null); }
  function review(action: "approved" | "rejected") {
    if (!modal) return;
    setNotice(`${modal.row.employeeName} request ${action}.`);
    setModal(null);
  }

  return (
    <section className="w-full p-5">
      <div className="flex flex-col gap-4">
        {notice ? <div className="rounded-[12px] border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3 text-[14px] font-medium text-[#166534]">{notice}</div> : null}
        {props.rows.map((row) => (
          <article key={row.id} className="flex min-h-[172px] items-center justify-between gap-6 rounded-[16px] border border-[#D8E8FF] bg-[rgba(255,255,255,0.72)] px-5 py-6">
            <div className="flex min-w-0 flex-1 items-start gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] bg-[#F1F5F9]"><MonitorIcon /></div>
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-[var(--font-inter)] text-[18px] font-semibold leading-8 text-[#0F172A]">{row.employeeName}</h3>
                  <StatusBadge status={statusText(row.status)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">Requesting: {row.assetName}</p>
                  <p className="font-[var(--font-inter)] text-[12px] font-normal text-[#64748B]">{row.note || `Need ${row.assetName.toLowerCase()} for daily work.`}</p>
                  <p className="font-[var(--font-inter)] text-[12px] font-normal text-[#64748B]">Requested: {formatDate(row.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 self-end">
              <ActionButton tone="light" onClick={() => setModal({ row, reason: "" })}>Dismiss</ActionButton>
              <ActionButton onClick={() => setModal({ row, reason: "" })}>Assign</ActionButton>
            </div>
          </article>
        ))}
      </div>
      {modal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]/65 px-4">
          <div className="w-full max-w-[636px] rounded-[32px] bg-white p-[30px] shadow-[0_32px_80px_rgba(15,23,42,0.28)]">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-[var(--font-inter)] text-[16px] font-semibold leading-8 text-[#111827]">Review asset request</h2>
                <p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">Approve or reject this asset request</p>
              </div>
              <button type="button" onClick={closeModal} className="text-[34px] leading-none text-[#111827]">×</button>
            </div>
            <div className="mt-[30px] grid grid-cols-2 gap-x-10 gap-y-4 border-t border-[#E2E8F0] pt-[30px]">
              <Field label="Employee" value={modal.row.employeeName} />
              <Field label="Requested asset" value={modal.row.assetName} />
            </div>
            <div className="mt-[30px] border-t border-[#E2E8F0] pt-[30px]">
              <p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">Justification</p>
              <div className="mt-4 rounded-[12px] border border-[#D8E2F0] bg-[#F1F5F9] px-5 py-4 font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#111827]">{modal.row.note || `Need a second ${modal.row.assetName.toLowerCase()} for daily work.`}</div>
            </div>
            <div className="mt-[30px] border-t border-[#E2E8F0] pt-[30px]">
              <label className="block font-[var(--font-inter)] text-[14px] font-semibold leading-8 text-[#111827]">
                Rejection reason (if rejecting)
                <textarea value={modal.reason} onChange={(event) => setModal({ ...modal, reason: event.target.value })} placeholder="Provide a reason if you’re rejecting this request..." className="mt-4 h-[110px] w-full rounded-[12px] border border-[#D8E2F0] px-5 py-4 font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B] outline-none placeholder:text-[#64748B]" />
              </label>
            </div>
            <div className="mt-[30px] flex justify-end gap-3">
              <button type="button" onClick={() => review("rejected")} className="h-[48px] rounded-[8px] bg-[#EF2B2A] px-7 font-[var(--font-inter)] text-[14px] font-medium text-white">Reject</button>
              <button type="button" onClick={() => review("approved")} className="inline-flex h-[48px] items-center gap-2 rounded-[8px] bg-[#0F172A] px-7 font-[var(--font-inter)] text-[14px] font-medium text-white"><MailIcon />Approve</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Field(props: { label: string; value: string }) {
  return <div><p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">{props.label}</p><p className="mt-3 font-[var(--font-inter)] text-[18px] font-semibold leading-8 text-[#0F172A]">{props.value}</p></div>;
}
function ActionButton(props: { children: React.ReactNode; onClick: () => void; tone?: "dark" | "light" }) {
  return <button type="button" onClick={props.onClick} className={`flex h-[36px] w-[92px] items-center justify-center rounded-[6px] font-[var(--font-inter)] text-[14px] font-normal leading-5 ${props.tone === "light" ? "bg-[#F1F5F9] text-[#0F172A]" : "bg-[#0F172A] text-white"}`}>{props.children}</button>;
}
function StatusBadge(props: { status: "Approved" | "Pending Review" }) {
  return <span className={`inline-flex h-[26px] items-center gap-1 rounded-[8px] border px-2.5 font-geist text-[12px] font-medium leading-4 ${props.status === "Approved" ? "border-[#A4F4CF] bg-[#D0FAE5] text-[#006045]" : "border-[#FEE685] bg-[#FEF3C6] text-[#973C00]"}`}><StatusIcon approved={props.status === "Approved"} />{props.status}</span>;
}
function StatusIcon(props: { approved: boolean }) {
  return props.approved ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function MonitorIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19 4H5C3.89543 4 3 4.89543 3 6V14C3 15.1046 3.89543 16 5 16H19C20.1046 16 21 15.1046 21 14V6C21 4.89543 20.1046 4 19 4Z" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M2 20H22" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function MailIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6H20V18H4V6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 8L12 13L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function formatDate(value: string) { const [year, month, day] = value.slice(0, 10).split("-"); return day && month && year ? `${day}/${month}/${year}` : value.slice(0, 10); }
function statusText(value: string) { return value.toLowerCase().includes("approve") ? "Approved" : "Pending Review"; }
