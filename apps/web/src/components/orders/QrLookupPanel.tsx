import { useState } from 'react';
import { formatDateTime } from '../../lib/format';
import type { Order } from '../../types/order';

type QrLookupPanelProps = {
  orders: Order[];
  initialCode?: string;
};

type QrMatch = {
  order: Order;
  item: Order['items'][number];
} | null;

const findByQr = (orders: Order[], code: string): QrMatch => {
  const needle = code.trim().toLowerCase();
  if (!needle) return null;
  for (const order of orders) {
    const item = order.items.find((x) => x.qrCode?.toLowerCase() === needle);
    if (item) return { order, item };
  }
  return null;
};

const normalizeCode = (value: string): string => {
  const raw = value.trim();
  if (!raw) return '';
  if (!raw.startsWith('http')) return raw;
  try {
    const url = new URL(raw);
    return url.searchParams.get('qr')?.trim() || raw;
  } catch {
    return raw;
  }
};

export function QrLookupPanel({ orders, initialCode = '' }: QrLookupPanelProps) {
  const [qrCode, setQrCode] = useState(initialCode);
  const match = findByQr(orders, normalizeCode(qrCode));

  return (
    <section className="panel">
      <h2>QR Lookup</h2>
      <label>
        QR Code
        <input value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Paste/scan QR code" />
      </label>
      {qrCode && !match ? <p className="row-meta">Item not found.</p> : null}
      {match ? (
        <div className="qr-details">
          <p className="row-meta"><strong>Item:</strong> {match.item.itemName}</p>
          <p className="row-meta"><strong>QR:</strong> {match.item.qrCode}</p>
          <p className="row-meta"><strong>Serial:</strong> {match.item.serialNumber || '-'}</p>
          <p className="row-meta"><strong>Manufactured:</strong> {match.item.manufacturedAt || '-'}</p>
          <p className="row-meta"><strong>Power Spec:</strong> {match.item.powerSpec || '-'}</p>
          <p className="row-meta"><strong>Condition:</strong> {match.item.conditionNote || '-'}</p>
          <p className="row-meta"><strong>Received By:</strong> {match.item.receivedBy?.fullName || '-'} ({match.item.receivedBy?.email || '-'})</p>
          <p className="row-meta"><strong>Received At:</strong> {formatDateTime(match.item.receivedAt)}</p>
          <p className="row-meta"><strong>Assigned To:</strong> {match.item.assignedTo?.fullName || 'Not assigned'} ({match.item.assignedTo?.email || '-'})</p>
          <p className="row-meta"><strong>Assigned At:</strong> {formatDateTime(match.item.assignedAt)}</p>
          <p className="row-meta"><strong>Assignment Note:</strong> {match.item.assignmentNote || '-'}</p>
          <p className="row-meta"><strong>Order:</strong> {match.order.whyOrdered}</p>
          <p className="row-meta"><strong>Office:</strong> {match.order.whichOffice}</p>
          <p className="row-meta"><strong>Status:</strong> {match.order.status}</p>
        </div>
      ) : null}
    </section>
  );
}
