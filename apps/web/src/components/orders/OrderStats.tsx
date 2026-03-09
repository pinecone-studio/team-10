import { formatCurrency } from '../../lib/format';

type OrderStatsProps = {
  orderCount: number;
  itemCount: number;
  totalSpend: number;
};

export function OrderStats({ orderCount, itemCount, totalSpend }: OrderStatsProps) {
  return (
    <section className="stats-grid" aria-label="Order statistics">
      <article className="stat-card">
        <p>Total Orders</p>
        <strong>{orderCount}</strong>
      </article>
      <article className="stat-card">
        <p>Total Items</p>
        <strong>{itemCount}</strong>
      </article>
      <article className="stat-card">
        <p>Total Spend</p>
        <strong>{formatCurrency(totalSpend)}</strong>
      </article>
    </section>
  );
}
