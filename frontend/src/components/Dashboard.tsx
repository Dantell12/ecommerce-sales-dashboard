'use client';

import { useMemo, useState } from 'react';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { AnalyticsFilters } from '@/types/analytics';

const defaultFilters: AnalyticsFilters = {
  from: '2017-01-01',
  to: '2018-12-31',
  customerState: 'SP',
};

export function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const stableFilters = useMemo(() => filters, [filters]);
  const { kpis, trend, topProducts, isLoading, error } = useDashboardData(stableFilters);

  return (
    <main className="dashboard-shell">
      <section className="toolbar" aria-label="Global filters">
        <label>
          From
          <input
            type="date"
            value={filters.from}
            onChange={(event) => setFilters({ ...filters, from: event.target.value })}
          />
        </label>
        <label>
          To
          <input
            type="date"
            value={filters.to}
            onChange={(event) => setFilters({ ...filters, to: event.target.value })}
          />
        </label>
        <label>
          Customer state
          <input
            value={filters.customerState ?? ''}
            onChange={(event) =>
              setFilters({ ...filters, customerState: event.target.value || undefined })
            }
            placeholder="SP"
          />
        </label>
        <label>
          Category
          <input
            value={filters.productCategory ?? ''}
            onChange={(event) =>
              setFilters({ ...filters, productCategory: event.target.value || undefined })
            }
            placeholder="health_beauty"
          />
        </label>
      </section>

      {error ? <p className="status status-error">{error}</p> : null}
      {isLoading ? <p className="status">Loading dashboard data...</p> : null}

      <section className="kpi-grid" aria-label="KPI summary">
        <KpiCard label="GMV" value={formatCurrency(kpis?.gmv)} />
        <KpiCard label="Revenue Paid" value={formatCurrency(kpis?.revenuePaid)} />
        <KpiCard label="Orders" value={formatNumber(kpis?.orders)} />
        <KpiCard label="AOV" value={formatCurrency(kpis?.aov)} />
        <KpiCard label="Items / Order" value={formatNumber(kpis?.itemsPerOrder)} />
        <KpiCard label="Cancel Rate" value={formatPercent(kpis?.cancellationRate)} />
        <KpiCard label="On-Time" value={formatPercent(kpis?.onTimeDeliveryRate)} />
        <KpiCard label="Shipping" value={formatCurrency(kpis?.shipping)} />
      </section>

      <section className="content-grid">
        <div className="panel">
          <h2>Revenue trend</h2>
          <div className="trend-list">
            {trend.slice(0, 12).map((point) => (
              <div key={point.period} className="trend-row">
                <span>{point.period}</span>
                <strong>{formatCurrency(point.revenuePaid)}</strong>
                <span>{point.orders} orders</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h2>Top products by GMV</h2>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>GMV</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr key={product.productId}>
                  <td>{product.productId.slice(0, 8)}</td>
                  <td>{product.category ?? 'unknown'}</td>
                  <td>{formatCurrency(product.gmv)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="kpi-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function formatCurrency(value = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value = 0): string {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value = 0): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}
