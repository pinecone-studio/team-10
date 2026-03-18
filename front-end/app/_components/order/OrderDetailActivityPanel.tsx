"use client";

import { useMemo, useState } from "react";
import type { StoredOrder } from "../../_lib/order-store";
import { buildFeedEvents, getOrderPresentation } from "./orderPresentation";

export function OrderDetailActivityPanel({ order }: { order: StoredOrder }) {
  const [commentText, setCommentText] = useState("");
  const [localComments, setLocalComments] = useState<string[]>([]);
  const presentation = getOrderPresentation(order.status);
  const feedEvents = buildFeedEvents(order);
  const comments = useMemo(
    () =>
      [order.approvalMessage, order.higherUpNote, order.financeNote, order.receivedNote, ...localComments].filter(Boolean),
    [localComments, order.approvalMessage, order.financeNote, order.higherUpNote, order.receivedNote],
  );

  return (
    <section className="rounded-[18px] border border-[#d9e0e8] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
      <div className="border-b border-[#eef2f6] pb-4"><h3 className="text-[28px] font-semibold leading-none text-[#111827]">Activity Feed</h3></div>
      <div className="space-y-6 py-5">
        {feedEvents.map((event, index) => (
          <div key={`${event.date}-${index}`} className="flex gap-3">
            <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#dbeafe] text-xs font-semibold text-[#2563eb]">{event.actor.slice(0, 2).toUpperCase()}</div>
            <div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-[#334155]">{event.actor}</p><p className="text-xs text-[#94a3b8]">{index === 0 ? presentation.type : "Requester"}</p></div><p className="mt-1 text-sm text-[#64748b]">{event.message}</p><p className="mt-2 text-xs text-[#94a3b8]">{event.date}</p></div>
          </div>
        ))}
        {comments.map((comment, index) => (
          <div key={`${comment}-${index}`} className="flex gap-3">
            <div className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#bbf7d0] text-xs font-semibold text-[#16a34a]">C</div>
            <div className="flex-1"><p className="text-sm font-medium text-[#334155]">Comment added</p><div className="mt-3 rounded-[12px] bg-[#f1f5f9] px-4 py-3 text-sm leading-6 text-[#334155]">{comment}</div></div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#eef2f6] pt-5">
        <h4 className="text-[28px] font-semibold leading-none text-[#111827]">Add comment</h4>
        <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Write your comment or feedback here..." className="mt-4 min-h-[120px] w-full rounded-[14px] border border-[#e2e8f0] px-4 py-3 text-sm text-[#111827] outline-none placeholder:text-[#94a3b8]" />
        <div className="mt-4 flex items-center justify-end gap-3">
          <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[#d9e0e8] bg-white text-lg text-[#111827] transition duration-150 hover:bg-[#f8fafc] active:scale-[0.98] active:bg-[#eef2f7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">+</button>
          <button type="button" onClick={() => { const nextComment = commentText.trim(); if (!nextComment) return; setLocalComments((current) => [...current, nextComment]); setCommentText(""); }} className="inline-flex h-11 items-center justify-center rounded-[10px] bg-[#111827] px-5 text-sm font-medium text-white transition duration-150 hover:bg-[#1f2937] active:scale-[0.98] active:bg-[#0f172a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7d2fe] focus-visible:ring-offset-2">Send comment</button>
        </div>
      </div>
    </section>
  );
}
