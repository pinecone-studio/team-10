"use client";

import { formatCurrency, formatDisplayDate, type StoredOrder } from "../../_lib/order-store";

export function OrderDetailItemsPanel({ order }: { order: StoredOrder }) {
  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.max(order.totalAmount - subtotal, 0);

  return (
    <section className="h-[650px] rounded-[20px] border border-[#e2efff] bg-white p-4 shadow-[0_14px_34px_rgba(125,170,232,0.12),0_6px_16px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between pb-4">
        <h3 className="text-[16px] font-semibold leading-none text-[#111827]">Order Items</h3>
        <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-medium text-[#4f82db]">{order.items.length} items</span>
      </div>
      <div className="mt-2 overflow-hidden rounded-[14px] border border-[#e6f0fb]">
        <div className="grid grid-cols-[44px_1.55fr_1.1fr_0.72fr_0.72fr_0.72fr_1fr] bg-[#eff6ff] px-3 py-3 text-[12px] font-medium text-[#64748b]">
          <span />
          <span>Item Name</span><span>Code</span><span>Qty</span><span>Unit</span><span>Price</span><span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-[#eef4fb]">
          {order.items.map((item, index) => (
            <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[44px_1.55fr_1.1fr_0.72fr_0.72fr_0.72fr_1fr] items-center gap-2 px-3 py-3 text-[13px] text-[#334155]">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f8fbff] text-[#94a3b8]">◫</span>
              <span className="rounded-[10px] border border-[#edf4fb] bg-white px-3 py-2">{item.name}</span>
              <span className="rounded-[10px] border border-[#edf4fb] bg-white px-3 py-2">{item.code}</span>
              <span className="rounded-[10px] border border-[#edf4fb] bg-white px-3 py-2 text-center">{item.quantity}</span>
              <span className="rounded-[10px] border border-[#edf4fb] bg-white px-3 py-2 text-center">{item.unit}</span>
              <span className="rounded-[10px] border border-[#edf4fb] bg-white px-3 py-2 text-center">{item.unitPrice}</span>
              <span className="text-right font-medium text-[#111827]">{formatCurrency(item.totalPrice, item.currencyCode)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 space-y-2 text-sm text-[#64748b]">
        <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-[#111827]">{formatCurrency(subtotal, order.currencyCode)}</span></div>
        <div className="flex items-center justify-between"><span>Tax (8%)</span><span className="font-medium text-[#111827]">{formatCurrency(tax, order.currencyCode)}</span></div>
        <div className="flex items-center justify-between border-t border-[#eef2f6] pt-3 text-base font-semibold text-[#111827]"><span>Total</span><span>{formatCurrency(order.totalAmount, order.currencyCode)}</span></div>
      </div>
      <div className="mt-5 rounded-[10px] bg-[#edf4ff] px-4 py-3 text-sm text-[#64748b]">Requested by <span className="font-medium text-[#111827]">{order.requester || "Unknown requester"}</span> on <span className="font-medium text-[#111827]">{formatDisplayDate(order.requestDate)}</span>.</div>
    </section>
  );
}
