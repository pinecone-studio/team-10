"use client";

import { formatDisplayDate } from "../../_lib/order-store";
import { ActionButton, EmptyState } from "../shared/WorkspacePrimitives";
import type {
  DistributionItem,
  DistributionSession,
  RetrievalDraft,
} from "./hrDistributionHelpers";

function Info(props: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`rounded-[10px] bg-[#f8fafc] px-3 py-2 ${props.wide ? "md:col-span-2" : ""}`}>
      <p className="text-[11px] text-[#64748b]">{props.label}</p>
      <p className="mt-1 text-[12px] text-[#0f172a]">{props.value}</p>
    </div>
  );
}

function SessionCard(props: { session: DistributionSession; index: number }) {
  const active = props.session.returnedAt === "-";
  return (
    <div className="rounded-[14px] border border-[#dbe7f3] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-[#0f172a]">
            {props.index + 1}. {props.session.holder}
          </p>
          <p className="mt-1 text-[12px] text-[#64748b]">{props.session.role}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            active ? "bg-[#e8f7ee] text-[#166534]" : "bg-[#eef2f7] text-[#475569]"
          }`}
        >
          {active ? "Current assignment" : "Returned"}
        </span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <Info label="Assigned at" value={formatDisplayDate(props.session.assignedAt)} />
        <Info label="Returned at" value={props.session.returnedAt === "-" ? "Currently assigned" : formatDisplayDate(props.session.returnedAt)} />
        <Info label="Used for" value={props.session.years} />
        <Info label="Condition" value={props.session.condition} />
        <Info label="Power" value={props.session.power} />
        <Info label="Note" value={props.session.notes} wide />
      </div>
    </div>
  );
}

function AssetRow(props: {
  asset: DistributionItem;
  actionLabel: string;
  open: boolean;
  draft?: RetrievalDraft;
  onAction: (asset: DistributionItem) => void;
  onToggleOpen?: (value: string | null | ((current: string | null) => string | null)) => void;
  onDraftChange?: (assetId: string, key: keyof RetrievalDraft, value: string) => void;
  onRetrieve?: (asset: DistributionItem) => void;
}) {
  const good = props.asset.conditionStatus.toLowerCase() === "good";
  const lastSession = props.asset.sessions[0];
  const holderLabel = props.asset.holder ? "Current holder" : "Last holder";
  const holderValue = props.asset.holder ?? lastSession?.holder ?? "No previous holder";

  return (
    <div className="rounded-[14px] border border-[#e5ebf2] bg-white px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#0f172a]">{props.asset.assetName}</p>
          <p className="mt-1 text-[12px] text-[#64748b]">
            {props.asset.assetCode} | {props.asset.serialNumber ?? "No serial"} | {formatDisplayDate(props.asset.receivedAt)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#475569]">
            <span className={`rounded-full px-2 py-1 ${good ? "bg-[#e8f7ee] text-[#166534]" : "bg-[#fef3c7] text-[#92400e]"}`}>
              {good ? "Good" : "Damaged"}
            </span>
            <span className="rounded-full bg-[#eef2f7] px-2 py-1">{props.asset.storageName}</span>
            <span className="rounded-full bg-[#eef2f7] px-2 py-1">
              {props.asset.holder ? `${props.asset.holder} | ${props.asset.role}` : "Available in storage"}
            </span>
          </div>
          <p className="mt-2 text-[12px] text-[#475569]">{holderLabel}: {holderValue}</p>
        </div>

        {props.actionLabel === "Open" ? (
          <button
            type="button"
            onClick={() => props.onToggleOpen?.((current) => current === props.asset.id ? null : props.asset.id)}
            className="rounded-[10px] border border-[#dbe4ee] bg-white px-4 py-2 text-[13px] font-medium text-[#0f172a]"
          >
            Open
          </button>
        ) : props.actionLabel === "Assign" ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => props.onToggleOpen?.((current) => current === props.asset.id ? null : props.asset.id)}
              className="rounded-[10px] border border-[#dbe4ee] bg-white px-4 py-2 text-[13px] font-medium text-[#0f172a]"
            >
              Detail
            </button>
            <ActionButton variant="green" onClick={() => props.onAction(props.asset)}>
              Assign
            </ActionButton>
          </div>
        ) : null}
      </div>

      {props.open ? (
        <div className="mt-3 grid gap-3 border-t border-[#eef2f7] pt-3">
          {props.asset.sessions.length > 0 ? (
            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold text-[#0f172a]">Assignment history</p>
                  <p className="text-[12px] text-[#64748b]">This asset&apos;s previous handoff and retrieval sessions.</p>
                </div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-semibold text-[#35589c]">
                  {props.asset.sessions.length} record{props.asset.sessions.length > 1 ? "s" : ""}
                </span>
              </div>
              {props.asset.sessions.map((session: DistributionSession, index) => (
                <SessionCard key={`${props.asset.id}-session-${index}`} session={session} index={index} />
              ))}
            </div>
          ) : (
            <div className="rounded-[12px] border border-dashed border-[#dbe4ee] bg-[#f8fbff] px-4 py-5 text-[12px] text-[#64748b]">
              No previous handoff history yet.
            </div>
          )}

          {props.draft ? (
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={props.draft.condition}
                onChange={(e) => props.onDraftChange?.(props.asset.id, "condition", e.target.value)}
                className="h-10 rounded-[10px] border border-[#dbe4ee] px-3 text-[13px] outline-none"
              >
                <option>Okay</option>
                <option>Damaged</option>
                <option>Torn</option>
                <option>Worn</option>
              </select>
              <select
                value={props.draft.power}
                onChange={(e) => props.onDraftChange?.(props.asset.id, "power", e.target.value)}
                className="h-10 rounded-[10px] border border-[#dbe4ee] px-3 text-[13px] outline-none"
              >
                <option>Working</option>
                <option>Turns on/off</option>
                <option>Not working</option>
              </select>
              <textarea
                value={props.draft.notes}
                onChange={(e) => props.onDraftChange?.(props.asset.id, "notes", e.target.value)}
                placeholder="Notes: damaged, torn, works well, issue details..."
                rows={3}
                className="rounded-[10px] border border-[#dbe4ee] px-3 py-2 text-[13px] outline-none md:col-span-2"
              />
              <p className="text-[12px] text-[#64748b] md:col-span-2">
                Used duration is calculated automatically from assign date to retrieval date.
              </p>
              <div className="flex justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={() => props.onRetrieve?.(props.asset)}
                  className="rounded-[10px] bg-[#dc2626] px-4 py-2 text-[13px] font-semibold text-white"
                >
                  Retrieve
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HRDistributionAssetPanel(props: {
  title: string;
  description: string;
  items: DistributionItem[];
  actionLabel: string;
  openAssetId?: string | null;
  controls?: React.ReactNode;
  draftFor?: (assetId: string) => RetrievalDraft;
  onAction: (asset: DistributionItem) => void;
  onDraftChange?: (assetId: string, key: keyof RetrievalDraft, value: string) => void;
  onRetrieve?: (asset: DistributionItem) => void;
  onToggleOpen?: (value: string | null | ((current: string | null) => string | null)) => void;
}) {
  return (
    <section className="rounded-[16px] border border-[#e2e8f0] bg-[#fbfdff]">
      <div className="border-b border-[#edf2f7] px-4 py-3">
        <p className="text-[15px] font-semibold text-[#0f172a]">{props.title}</p>
        <p className="mt-1 text-[12px] text-[#64748b]">{props.description}</p>
      </div>
      {props.controls}
      <div className="space-y-2 p-3">
        {props.items.length === 0 ? (
          <EmptyState title="No items" description="End list empty baina." />
        ) : (
          props.items.map((asset) => (
            <AssetRow
              key={`${asset.id}-${asset.distributionId ?? "storage"}`}
              asset={asset}
              actionLabel={props.actionLabel}
              onAction={props.onAction}
              open={props.openAssetId === asset.id}
              draft={props.draftFor?.(asset.id)}
              onDraftChange={props.onDraftChange}
              onRetrieve={props.onRetrieve}
              onToggleOpen={props.onToggleOpen}
            />
          ))
        )}
      </div>
    </section>
  );
}
