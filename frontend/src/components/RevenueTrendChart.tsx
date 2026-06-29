'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { RevenueTrendPoint } from '@/types/analytics';

interface RevenueTrendChartProps {
  data: RevenueTrendPoint[];
}

export function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
        <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="period"
          minTickGap={32}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <YAxis
          yAxisId="revenue"
          tickFormatter={formatCompactCurrency}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tickFormatter={formatCompactNumber}
          tickLine={false}
          axisLine={false}
          tick={{ fill: '#64748b', fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, name) => [
            name === 'Ingresos' ? formatCurrency(Number(value)) : formatNumber(Number(value)),
            name,
          ]}
          labelFormatter={(label) => `Periodo: ${label}`}
          contentStyle={{
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
          }}
        />
        <Legend />
        <Line
          yAxisId="revenue"
          type="monotone"
          dataKey="revenuePaid"
          name="Ingresos"
          stroke="#059669"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5 }}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name="Pedidos"
          stroke="#2563eb"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompactCurrency(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    notation: 'compact',
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-EC').format(value);
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('es-EC', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
