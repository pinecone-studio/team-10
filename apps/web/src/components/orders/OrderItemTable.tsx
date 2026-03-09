import { formatCurrency, formatDateTime } from '../../lib/format';
import type { OrderItem } from '../../types/order';
import { QrCodeBadge } from './QrCodeBadge';

type OrderItemTableProps = {
  items: OrderItem[];
};

export function OrderItemTable({ items }: OrderItemTableProps) {
  if (items.length === 0) {
    return <p className="empty-note">No items registered for this order.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Unit Cost</th>
            <th>Source</th>
            <th>Category</th>
            <th>ETA</th>
            <th>Receive</th>
            <th>Mfg</th>
            <th>QR</th>
            <th>Assigned</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <strong>{item.itemName}</strong>
                {item.additionalNotes ? <span className="row-meta">{item.additionalNotes}</span> : null}
              </td>
              <td>{item.quantity}</td>
              <td>{formatCurrency(item.unitCost)}</td>
              <td>{item.fromWhere}</td>
              <td>{item.category || 'General'}</td>
              <td>{formatDateTime(item.eta)}</td>
              <td>{item.receiveStatus === 'RECEIVED' ? `Done (${item.serialNumber || '-'})` : 'Pending'}</td>
              <td>{item.manufacturedAt || '-'}</td>
              <td>{item.qrCode ? <QrCodeBadge value={item.qrCode} label={item.itemName} /> : '-'}</td>
              <td>{item.assignedTo?.fullName || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
