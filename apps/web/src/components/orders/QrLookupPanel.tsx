import { useMemo, useState } from 'react';
import { formatDateTime } from '../../lib/format';
import type { Order } from '../../types/order';

type QrLookupPanelProps = {
  orders: Order[];
  initialCode?: string;
};

type QrMatch = { order: Order; item: Order['items'][number] } | null;

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

const findByQr = (orders: Order[], code: string): QrMatch => {
  const needle = normalizeCode(code).toLowerCase();
  if (!needle) return null;
  for (const order of orders) {
    const item = order.items.find((x) => x.qrCode?.toLowerCase() === needle);
    if (item) return { order, item };
  }
  return null;
};

export function QrLookupPanel({ orders, initialCode = '' }: QrLookupPanelProps) {
  const [qrCode, setQrCode] = useState(initialCode);
  const [copyState, setCopyState] = useState('');
  const [pasteError, setPasteError] = useState('');
  const normalized = normalizeCode(qrCode);
  const match = findByQr(orders, normalized);
  const qrOptions = useMemo(
    () =>
      [...new Set(orders.flatMap((order) => order.items.map((item) => item.qrCode).filter((x): x is string => Boolean(x))))]
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 80),
    [orders],
  );

  const pasteFromClipboard = async () => {
    setPasteError('');
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) throw new Error('Clipboard is empty.');
      setQrCode(text.trim());
    } catch {
      setPasteError('Clipboard access denied. Paste manually.');
    }
  };

  const copyLookupLink = async () => {
    if (!normalized) return;
    const link = `${window.location.origin}${window.location.pathname}?qr=${encodeURIComponent(normalized)}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopyState('Lookup link copied.');
      window.setTimeout(() => setCopyState(''), 1800);
    } catch {
      setCopyState('Copy failed.');
      window.setTimeout(() => setCopyState(''), 1800);
    }
  };

  return (
    <section className="panel">
      <h2>QR Lookup</h2>
      <label>
        QR Code
        <input list="qr-code-options" value={qrCode} onChange={(e) => setQrCode(e.target.value)} placeholder="Paste/scan QR code or URL" />
      </label>
      <datalist id="qr-code-options">{qrOptions.map((code) => <option key={code} value={code} />)}</datalist>
      <div className="form-actions">
        <button type="button" className="button-muted" onClick={() => void pasteFromClipboard()}>
          Paste
        </button>
        <button type="button" className="button-muted" disabled={!normalized} onClick={() => setQrCode('')}>
          Clear
        </button>
        <button type="button" className="button-muted" disabled={!normalized} onClick={() => void copyLookupLink()}>
          Copy Link
        </button>
      </div>
      {pasteError ? <p className="inline-error">{pasteError}</p> : null}
      {copyState ? <p className="row-meta">{copyState}</p> : null}
      {normalized && !match ? <p className="row-meta">Item not found.</p> : null}
      {!normalized && qrOptions.length ? <p className="row-meta">Tip: start typing to select an existing QR code.</p> : null}
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
