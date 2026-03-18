"use client";

import { formatCurrency, formatDisplayDate, type StoredOrder } from "../../_lib/order-store";

export function OrderDetailItemsPanel({ order }: { order: StoredOrder }) {
  const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.max(order.totalAmount - subtotal, 0);

  return (
    <section className="rounded-[18px] border border-[#d9e0e8] bg-white p-4 shadow-[0_18px_44px_rgba(15,23,42,0.07)]">
      <div className="flex items-center justify-between border-b border-[#eef2f6] pb-4">
        <h3 className="text-[28px] font-semibold leading-none text-[#111827]">Order Items</h3>
        <span className="rounded-full bg-[#eff6ff] px-3 py-1 text-xs font-medium text-[#2563eb]">{order.items.length} items</span>
      </div>
      <div className="mt-4 overflow-hidden rounded-[14px] border border-[#e2e8f0]">
        <div className="grid grid-cols-[1.6fr_1.1fr_0.8fr_0.8fr_0.8fr_1fr] bg-[#eff6ff] px-4 py-3 text-xs font-medium uppercase tracking-[0.02em] text-[#64748b]">
          <span>Item Name</span><span>Code</span><span>Qty</span><span>Unit</span><span>Price</span><span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-[#eef2f6]">
          {order.items.map((item, index) => <div key={`${item.catalogId}-${index}`} className="grid grid-cols-[1.6fr_1.1fr_0.8fr_0.8fr_0.8fr_1fr] items-center px-4 py-4 text-sm text-[#334155]"><span className="font-medium text-[#111827]">{item.name}</span><span>{item.code}</span><span>{item.quantity}</span><span>{item.unit}</span><span>{item.unitPrice}</span><span className="text-right font-medium">{formatCurrency(item.totalPrice, item.currencyCode)}</span></div>)}
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm text-[#64748b]">
        <div className="flex items-center justify-between"><span>Subtotal</span><span className="font-medium text-[#111827]">{formatCurrency(subtotal, order.currencyCode)}</span></div>
        <div className="flex items-center justify-between"><span>Tax (8%)</span><span className="font-medium text-[#111827]">{formatCurrency(tax, order.currencyCode)}</span></div>
        <div className="flex items-center justify-between border-t border-[#eef2f6] pt-3 text-base font-semibold text-[#111827]"><span>Total</span><span>{formatCurrency(order.totalAmount, order.currencyCode)}</span></div>
      </div>
      <div className="mt-6 rounded-[14px] bg-[#f8fafc] p-4 text-sm text-[#64748b]">Requested by <span className="font-medium text-[#111827]">{order.requester || "Unknown requester"}</span> on <span className="font-medium text-[#111827]">{formatDisplayDate(order.requestDate)}</span>.</div>
    </section>
  );
}
