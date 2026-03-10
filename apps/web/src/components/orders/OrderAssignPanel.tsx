import { useMemo, useState } from 'react';
import type { AssignOrderItemInput, Order, User } from '../../types/order';

type OrderAssignPanelProps = {
  order: Order;
  users: User[];
  disabled: boolean;
  onAssign: (items: AssignOrderItemInput[]) => Promise<void>;
};

export function OrderAssignPanel({ order, users, disabled, onAssign }: OrderAssignPanelProps) {
  const employees = useMemo(() => users.filter((u) => u.role === 'EMPLOYEE'), [users]);
  const assignableItems = useMemo(() => order.items.filter((item) => item.receiveStatus === 'RECEIVED' && !item.assignedTo), [order.items]);
  const [draft, setDraft] = useState<Record<string, { assignedToUserId: string; assignmentNote: string }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDisabled = disabled || isSubmitting;

  const update = (itemId: string, key: 'assignedToUserId' | 'assignmentNote', value: string) => {
    setDraft((prev) => ({ ...prev, [itemId]: { assignedToUserId: prev[itemId]?.assignedToUserId || '', assignmentNote: prev[itemId]?.assignmentNote || '', [key]: value } }));
  };

  const submit = async () => {
    const payload = assignableItems
      .map((item) => ({ itemId: item.id, assignedToUserId: draft[item.id]?.assignedToUserId || '', assignmentNote: draft[item.id]?.assignmentNote || '' }))
      .filter((item) => item.assignedToUserId);
    if (!payload.length) {
      setError('Choose at least one employee for assignment.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onAssign(payload);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Assign failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!employees.length) return <p className="row-meta">No EMPLOYEE user found for assignment.</p>;
  if (!assignableItems.length) return <p className="row-meta">All received items are already assigned.</p>;

  return (
    <div className="receive-panel">
      <p className="row-meta">HR Manager: assign received assets to employees.</p>
      {error ? <p className="inline-error">{error}</p> : null}
      {assignableItems.map((item) => (
        <div key={item.id} className="receive-row">
          <strong>{item.itemName}</strong>
          <select disabled={isDisabled} value={draft[item.id]?.assignedToUserId || ''} onChange={(e) => update(item.id, 'assignedToUserId', e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>)}
          </select>
          <input disabled={isDisabled} placeholder="Assignment note" value={draft[item.id]?.assignmentNote || ''} onChange={(e) => update(item.id, 'assignmentNote', e.target.value)} />
        </div>
      ))}
      <button type="button" disabled={isDisabled} onClick={() => void submit()}>
        {isSubmitting ? 'Assigning...' : 'Assign Items'}
      </button>
    </div>
  );
}
