export type DateGrain = 'day' | 'week';
export type ProductRankingMetric = 'gmv' | 'revenue';

export interface AnalyticsFilters {
  from: string;
  to: string;
  orderStatus?: string;
  productCategory?: string;
  customerState?: string;
}

export interface KpiSummary {
  gmv: number;
  shipping: number;
  revenuePaid: number;
  orders: number;
  aov: number;
  itemsPerOrder: number;
  cancellationRate: number;
  onTimeDeliveryRate: number;
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

export interface AnalyticsRepository {
  getKpis(filters: AnalyticsFilters): Promise<KpiSummary>;
  getRevenueTrend(filters: AnalyticsFilters, grain: DateGrain): Promise<RevenueTrendPoint[]>;
  getTopProducts(
    filters: AnalyticsFilters,
    metric: ProductRankingMetric,
    limit: number,
  ): Promise<TopProduct[]>;
}
