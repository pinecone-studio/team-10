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
  const statusLabel = order.status.replace('FINANCE_', 'FINANCE ').replace('_', ' ');
  const showFinanceAction = canFinanceReview && order.status === 'SUBMITTED';
  const showReceiveAction = canReceive && order.status === 'FINANCE_APPROVED';
  const showAssignAction = canAssign && order.status === 'IT_RECEIVED';

  return (
    <article className="order-card">
      <div className="order-head">
        <div>
          <h3>{order.whyOrdered}</h3>
          <p>{order.orderProcess}</p>
        </div>
        <strong>{formatCurrency(order.totalCost)}</strong>
      </div>

      <dl className="order-meta">
        <div>
          <dt>Requester</dt>
          <dd>{order.requester.fullName}</dd>
        </div>
        <div>
          <dt>Office</dt>
          <dd>{order.whichOffice}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        <div>
          <dt>Arrival</dt>
          <dd>{formatDateTime(order.whenToArrive)}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDateTime(order.updatedAt)}</dd>
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
      {order.status === 'IT_RECEIVED' ? (
        <p className="row-meta">
          Received by IT Admin. Assigned: {order.items.filter((item) => item.assignedTo).length}/{order.items.length}
        </p>
      ) : null}

      <OrderItemTable items={order.items} />
    </article>
  );
}
