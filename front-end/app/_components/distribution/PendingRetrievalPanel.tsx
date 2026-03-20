"use client";

import { useMemo, useState } from "react";
import type { DistributionItem } from "./hrDistributionHelpers";

export default function PendingRetrievalPanel(props: { items: DistributionItem[] }) {
  const [messages, setMessages] = useState<Record<string, string>>({});
  const cards = useMemo(() => props.items.slice(0, 6).map((item, index) => ({
    id: item.id,
    employee: item.holder || "Unassigned employee",
    department: item.role || "Operations",
    assets: [item.assetName, item.itemType === item.assetName ? "" : item.itemType].filter(Boolean).join(", "),
    dueBack: buildDueDate(item.receivedAt, index),
  })), [props.items]);

  return (
    <section className="w-full rounded-[24px] bg-[rgba(255,255,255,0.7)] p-5">
      <div className="rounded-[16px] border border-[#D8E8FF] bg-[linear-gradient(180deg,#eef7ff_0%,#ffffff_100%)] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[760px]">
            <h2 className="font-[var(--font-inter)] text-[20px] font-semibold leading-9 text-[#0F172A]">Assets that must be collected from employees</h2>
            <p className="font-[var(--font-inter)] text-[12px] font-normal leading-8 text-[#64748B]">Keep offboarding and return work visible here so the team can retrieve company assets before reassignment, storage, or closure.</p>
          </div>
          <div className="flex items-center gap-3">
            <Chip tone="danger">PENDING RETRIEVAL</Chip>
            <Chip tone="info">OPEN CASES {cards.length}</Chip>
          </div>
        </div>
        <div className="mt-3 grid gap-3 xl:grid-cols-3">
          {cards.map((card) => (
            <article key={card.id} className="flex h-[258px] flex-1 flex-col items-start gap-1.5 rounded-[24px] border border-[#D8E8FF] bg-white px-4 pt-4 pb-3 shadow-[0_8px_24px_rgba(148,163,184,0.08)]">
              <div className="flex flex-col items-start gap-1 self-stretch pt-1">
                <h3 className="font-[var(--font-inter)] text-[18px] font-semibold leading-7 text-[#0A1020]">{card.employee}</h3>
                <p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#64748B]">{card.department}</p>
                <Info label="ASSETS" value={card.assets} />
                <Info label="DUE BACK" value={card.dueBack} />
              </div>
              <div className="mt-auto -mx-1 flex w-[calc(100%+8px)] gap-2 pt-1">
                <ActionButton tone="success" onClick={() => setMessages((current) => ({ ...current, [card.id]: "Solved" }))}>Solved</ActionButton>
                <ActionButton tone="danger" onClick={() => setMessages((current) => ({ ...current, [card.id]: "Broken or missing" }))}>Broken or missing</ActionButton>
              </div>
              <p className={`min-h-[20px] pt-1 font-[var(--font-inter)] text-[12px] font-normal text-[#64748B] ${messages[card.id] ? "" : "invisible"}`}>Status: {messages[card.id] ?? "Solved"}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Chip(props: { children: React.ReactNode; tone: "danger" | "info" }) {
  return <span className={`inline-flex h-[24px] items-center rounded-full border px-3 font-geist text-[12px] font-medium leading-4 ${props.tone === "danger" ? "border-[#FCA5A5] bg-[#FEE2E2] text-[#EF4444]" : "border-[#93C5FD] bg-[#DBEAFE] text-[#2563EB]"}`}>{props.children}</span>;
}

function Info(props: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="font-[var(--font-inter)] text-[10px] font-normal leading-none text-[#94A3B8]">{props.label}</p>
      <p className="font-[var(--font-inter)] text-[14px] font-normal leading-5 text-[#050810]">{props.value}</p>
    </div>
  );
}

function ActionButton(props: { children: React.ReactNode; tone: "success" | "danger"; onClick: () => void }) {
  return <button type="button" onClick={props.onClick} className={`flex h-[40px] flex-1 items-center justify-center rounded-[8px] font-[var(--font-inter)] text-[14px] font-normal leading-5 outline-none transition focus:outline-none focus-visible:outline-none focus-visible:ring-0 ${props.tone === "success" ? "bg-[#D0FAE5] text-[#16A34A]" : "bg-[#FEE2E2] text-[#EF4444]"}`}>{props.children}</button>;
}

function buildDueDate(value: string, index: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  date.setDate(date.getDate() + 7 + index * 4);
  return date.toISOString().slice(0, 10);
}
