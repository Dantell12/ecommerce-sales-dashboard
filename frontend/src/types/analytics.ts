export interface AnalyticsFilters {
  from: string;
  to: string;
  order_status?: string;
  product_category_name?: string;
  customer_state?: string;
}

export interface KpiMetrics {
  gmv: number;
  shipping: number;
  revenuePaid: number;
  orders: number;
  aov: number;
  itemsPerOrder: number;
  cancellationRate: number;
  onTimeDeliveryRate: number;
}

export interface KpiSummary extends KpiMetrics {
  topProductsByGmv: TopProduct[];
  topProductsByRevenue: TopProduct[];
  revenueTrend: RevenueTrendPoint[];
}

export interface RevenueTrendPoint {
  period: string;
  revenuePaid: number;
  orders: number;
}

export interface TopProduct {
  productId: string;
  category: string | null;
  gmv: number;
  revenuePaid: number;
  orders: number;
}
