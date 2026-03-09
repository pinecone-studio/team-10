import { useState } from 'react';
import type { Order, ReceiveOrderItemInput } from '../../types/order';

type OrderReceivePanelProps = {
  order: Order;
  disabled: boolean;
  onReceive: (items: ReceiveOrderItemInput[]) => Promise<void>;
};

export function OrderReceivePanel({ order, disabled, onReceive }: OrderReceivePanelProps) {
  const [form, setForm] = useState<Record<string, Omit<ReceiveOrderItemInput, 'itemId'>>>({});
  const [error, setError] = useState<string | null>(null);
  const pendingItems = order.items.filter((item) => item.receiveStatus === 'PENDING');

  const update = (itemId: string, key: 'serialNumber' | 'manufacturedAt' | 'powerSpec' | 'conditionNote', value: string) => {
    setForm((prev) => ({ ...prev, [itemId]: { serialNumber: prev[itemId]?.serialNumber || '', manufacturedAt: prev[itemId]?.manufacturedAt || '', powerSpec: prev[itemId]?.powerSpec || '', conditionNote: prev[itemId]?.conditionNote || '', [key]: value } }));
  };

  const submit = async () => {
    const payload = pendingItems.map((item) => ({ itemId: item.id, serialNumber: form[item.id]?.serialNumber || '', manufacturedAt: form[item.id]?.manufacturedAt || '', powerSpec: form[item.id]?.powerSpec || '', conditionNote: form[item.id]?.conditionNote || '' }));
    if (!payload.length) return;
    const invalid = payload.find((item) => !item.serialNumber.trim() || !item.manufacturedAt.trim() || !item.powerSpec.trim());
    if (invalid) {
      setError('Serial, Manufactured YYYY-MM, Power spec бүгд шаардлагатай.');
      return;
    }
    setError(null);
    try {
      await onReceive(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Receive failed');
    }
  };

  const applyDemo = () => {
    const month = new Date().toISOString().slice(0, 7);
    const next: Record<string, Omit<ReceiveOrderItemInput, 'itemId'>> = {};
    pendingItems.forEach((item, index) => {
      next[item.id] = {
        serialNumber: `SN-${item.id}-${String(index + 1).padStart(2, '0')}`,
        manufacturedAt: month,
        powerSpec: '220V / 50Hz',
        conditionNote: 'Visual check OK',
      };
    });
    setError(null);
    setForm((prev) => ({ ...prev, ...next }));
  };

  if (!pendingItems.length) return <p className="row-meta">All items are already received.</p>;

  return (
    <div className="receive-panel">
      <p className="row-meta">IT Admin: fill serial, manufactured date, power spec and condition.</p>
      {error ? <p className="inline-error">{error}</p> : null}
      {pendingItems.map((item) => (
        <div key={item.id} className="receive-row">
          <strong>{item.itemName}</strong>
          <input placeholder="Serial" value={form[item.id]?.serialNumber || ''} onChange={(e) => update(item.id, 'serialNumber', e.target.value)} />
          <input type="month" placeholder="Manufactured YYYY-MM" value={form[item.id]?.manufacturedAt || ''} onChange={(e) => update(item.id, 'manufacturedAt', e.target.value)} />
          <input placeholder="Power spec" value={form[item.id]?.powerSpec || ''} onChange={(e) => update(item.id, 'powerSpec', e.target.value)} />
          <input placeholder="Condition note" value={form[item.id]?.conditionNote || ''} onChange={(e) => update(item.id, 'conditionNote', e.target.value)} />
        </div>
      ))}
      <button type="button" className="button-muted" disabled={disabled} onClick={applyDemo}>
        Demo
      </button>
      <button type="button" disabled={disabled} onClick={() => void submit()}>Confirm Receive</button>
    </div>
  );
}
