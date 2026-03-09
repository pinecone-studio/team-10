import { useMemo, useState } from 'react';
import type { Order, User } from '../../types/order';
import { OrderCard } from './OrderCard';

type OrderListProps = {
  orders: Order[];
  users: User[];
  isLoading: boolean;
  canFinanceReview: boolean;
  canReceive: boolean;
  canAssign: boolean;
  isSaving: boolean;
  onReview: (orderId: string, decision: 'APPROVE' | 'REJECT', comment?: string) => Promise<void>;
  onReceive: (orderId: string, items: { itemId: string; serialNumber: string; manufacturedAt: string; powerSpec: string; conditionNote?: string }[]) => Promise<void>;
  onAssign: (orderId: string, items: { itemId: string; assignedToUserId: string; assignmentNote?: string }[]) => Promise<void>;
};

const normalize = (value: string) => value.trim().toLowerCase();

export function OrderList({ orders, users, isLoading, canFinanceReview, canReceive, canAssign, isSaving, onReview, onReceive, onAssign }: OrderListProps) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const categories = useMemo(
    () => ['ALL', ...new Set(orders.flatMap((o) => o.items.map((i) => i.category || 'General')).sort((a, b) => a.localeCompare(b)))],
    [orders],
  );
  const filtered = useMemo(() => {
    const needle = normalize(search);
    return orders.filter((order) => {
      const statusMatch = status === 'ALL' || order.status === status;
      const categoryMatch = category === 'ALL' || order.items.some((i) => (i.category || 'General') === category);
      if (!statusMatch || !categoryMatch) return false;
      if (!needle) return true;
      const haystack = [
        order.id,
        order.whyOrdered,
        order.orderProcess,
        order.whichOffice,
        order.requester.fullName,
        order.requester.email,
        order.items.map((i) => `${i.itemName} ${i.category || ''} ${i.serialNumber || ''} ${i.qrCode || ''}`).join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [orders, search, status, category]);

  if (isLoading) return <p className="status-message">Loading orders...</p>;
  if (orders.length === 0) return <p className="status-message">No orders yet. Create the first order from the form.</p>;

  return (
    <>
      <div className="filter-row">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search: order, requester, item, serial, QR" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="SUBMITTED">SUBMITTED</option>
          <option value="FINANCE_APPROVED">FINANCE_APPROVED</option>
          <option value="FINANCE_REJECTED">FINANCE_REJECTED</option>
          <option value="IT_RECEIVED">IT_RECEIVED</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} title="Filter by item category">
          {categories.map((value) => <option key={value} value={value}>{value === 'ALL' ? 'All Categories' : value}</option>)}
        </select>
      </div>
      <p className="row-meta">Category filter is based on each order item category.</p>
      <section className="order-list" aria-label="Orders">
        {filtered.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            canFinanceReview={canFinanceReview}
            canReceive={canReceive}
            canAssign={canAssign}
            users={users}
            isSaving={isSaving}
            onReview={onReview}
            onReceive={onReceive}
            onAssign={onAssign}
          />
        ))}
      </section>
      {!filtered.length ? <p className="status-message">No orders match current filters.</p> : null}
    </>
  );
}
