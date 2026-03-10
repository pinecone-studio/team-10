import { useState } from 'react';
import { formatCurrency, formatDateTime } from '../../lib/format';
import type { Order, User } from '../../types/order';
import { OrderAssignPanel } from './OrderAssignPanel';
import { OrderItemTable } from './OrderItemTable';
import { OrderReceivePanel } from './OrderReceivePanel';
import { OrderReviewPanel } from './OrderReviewPanel';

type OrderCardProps = {
  order: Order;
  canFinanceReview: boolean;
  canReceive: boolean;
  canAssign: boolean;
  users: User[];
  isSaving: boolean;
  onReview: (orderId: string, decision: 'APPROVE' | 'REJECT', comment?: string) => Promise<void>;
  onReceive: (orderId: string, items: { itemId: string; serialNumber: string; manufacturedAt: string; powerSpec: string; conditionNote?: string }[]) => Promise<void>;
  onAssign: (orderId: string, items: { itemId: string; assignedToUserId: string; assignmentNote?: string }[]) => Promise<void>;
};

export function OrderCard({ order, canFinanceReview, canReceive, canAssign, users, isSaving, onReview, onReceive, onAssign }: OrderCardProps) {
  const [expanded, setExpanded] = useState(false);
  const statusLabel = order.status.replace('FINANCE_', 'FINANCE ').replace('_', ' ');
  const showFinanceAction = canFinanceReview && order.status === 'SUBMITTED';
  const showReceiveAction = canReceive && order.status === 'FINANCE_APPROVED';
  const showAssignAction = canAssign && order.status === 'IT_RECEIVED';
  const assignedCount = order.items.filter((item) => item.assignedTo).length;

  return (
    <article className="order-card">
      <div className="order-head">
        <div>
          <h3>{order.whyOrdered}</h3>
          <p>#{order.id} · {order.whichOffice} · {statusLabel}</p>
        </div>
        <div className="order-head-actions">
          <strong>{formatCurrency(order.totalCost)}</strong>
          <button type="button" className="button-muted" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? 'Hide Details' : 'View Details'}
          </button>
        </div>
      </div>

      <div className="order-summary-strip">
        <span>Requester: <strong>{order.requester.fullName}</strong></span>
        <span>Items: <strong>{order.items.length}</strong></span>
        <span>Assigned: <strong>{assignedCount}/{order.items.length}</strong></span>
        <span>Updated: <strong>{formatDateTime(order.updatedAt)}</strong></span>
      </div>

      {expanded ? (
        <>
          <dl className="order-meta">
            <div>
              <dt>Process</dt>
              <dd>{order.orderProcess}</dd>
            </div>
            <div>
              <dt>Arrival</dt>
              <dd>{formatDateTime(order.whenToArrive)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{statusLabel}</dd>
            </div>
          </dl>
          {order.financeComment ? <p className="row-meta">Finance note: {order.financeComment}</p> : null}
          {showFinanceAction ? (
            <OrderReviewPanel
              disabled={isSaving}
              onReview={(decision, comment) => onReview(order.id, decision, comment || '')}
              title="Finance Review"
              notePlaceholder="Finance note (optional)"
            />
          ) : null}
          {showReceiveAction ? (
            <OrderReceivePanel order={order} disabled={isSaving} onReceive={(items) => onReceive(order.id, items)} />
          ) : null}
          {showAssignAction ? (
            <OrderAssignPanel order={order} users={users} disabled={isSaving} onAssign={(items) => onAssign(order.id, items)} />
          ) : null}
          <OrderItemTable items={order.items} />
        </>
      ) : null}
    </article>
  );
}
