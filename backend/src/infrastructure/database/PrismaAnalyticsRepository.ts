import type { PrismaClient } from '@prisma/client';
import type {
  AnalyticsFilters,
  AnalyticsRepository,
  DateGrain,
  KpiMetrics,
  ProductRankingMetric,
  RevenueTrendPoint,
  TopProduct,
} from '../../domain/analytics';

type KpiRow = {
  gmv: NumericValue | null;
  shipping: NumericValue | null;
  revenue_paid: NumericValue | null;
  orders: bigint;
  items: bigint;
  canceled_orders: bigint;
  delivered_orders: bigint;
  on_time_orders: bigint;
};

type TrendRow = {
  period: Date | string;
  revenue_paid: NumericValue | null;
  orders: bigint;
};

type TopProductRow = {
  product_id: string;
  category: string | null;
  gmv: NumericValue | null;
  revenue_paid: NumericValue | null;
  orders: bigint;
};

type NumericValue = { toString(): string } | number | string;
type QueryParts = {
  whereSql: string;
  params: unknown[];
};

export class PrismaAnalyticsRepository implements AnalyticsRepository {
  constructor(private readonly db: PrismaClient) {}

  async getKpiSummary(filters: AnalyticsFilters): Promise<KpiMetrics> {
    const query = this.buildWhere(filters);
    const rows = await this.db.$queryRawUnsafe<KpiRow[]>(
      `
      SELECT
        COALESCE(SUM(fs.item_price), 0) AS gmv,
        COALESCE(SUM(fs.freight_value), 0) AS shipping,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue_paid,
        COUNT(DISTINCT fs.order_id) AS orders,
        COUNT(fs.order_item_id) AS items,
        COUNT(DISTINCT CASE WHEN fs.is_canceled THEN fs.order_id END) AS canceled_orders,
        COUNT(DISTINCT CASE WHEN fs.is_delivered THEN fs.order_id END) AS delivered_orders,
        COUNT(DISTINCT CASE WHEN fs.is_delivered AND fs.is_on_time THEN fs.order_id END) AS on_time_orders
      FROM gold.fact_sales fs
      JOIN gold.dim_order o ON o.order_key = fs.order_key
      JOIN gold.dim_product p ON p.product_key = fs.product_key
      JOIN gold.dim_customer c ON c.customer_key = fs.customer_key
      WHERE ${query.whereSql}
      `,
      ...query.params,
    );

    const row = rows[0];
    const orders = Number(row?.orders ?? 0);
    const items = Number(row?.items ?? 0);
    const revenuePaid = this.toNumber(row?.revenue_paid);
    const deliveredOrders = Number(row?.delivered_orders ?? 0);

    return {
      gmv: this.toNumber(row?.gmv),
      shipping: this.toNumber(row?.shipping),
      revenuePaid,
      orders,
      aov: orders === 0 ? 0 : revenuePaid / orders,
      itemsPerOrder: orders === 0 ? 0 : items / orders,
      cancellationRate: orders === 0 ? 0 : Number(row?.canceled_orders ?? 0) / orders,
      onTimeDeliveryRate:
        deliveredOrders === 0 ? 0 : Number(row?.on_time_orders ?? 0) / deliveredOrders,
    };
  }

  async getRevenueTrend(filters: AnalyticsFilters, grain: DateGrain): Promise<RevenueTrendPoint[]> {
    const truncUnit = grain === 'week' ? 'week' : 'day';
    const step = grain === 'week' ? '1 week' : '1 day';
    const query = this.buildWhere(filters);
    const rows = await this.db.$queryRawUnsafe<TrendRow[]>(
      `
      WITH date_range AS (
        SELECT generate_series(
          DATE_TRUNC('${truncUnit}', $1::date)::date,
          DATE_TRUNC('${truncUnit}', $2::date)::date,
          INTERVAL '${step}'
        )::date AS period
      ),
      aggregated AS (
        SELECT
          DATE_TRUNC('${truncUnit}', o.order_purchase_timestamp)::date AS period,
          COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue_paid,
          COUNT(DISTINCT fs.order_id) AS orders
        FROM gold.fact_sales fs
        JOIN gold.dim_order o ON o.order_key = fs.order_key
        JOIN gold.dim_product p ON p.product_key = fs.product_key
        JOIN gold.dim_customer c ON c.customer_key = fs.customer_key
        WHERE ${query.whereSql}
        GROUP BY 1
      )
      SELECT
        dr.period,
        COALESCE(a.revenue_paid, 0) AS revenue_paid,
        COALESCE(a.orders, 0) AS orders
      FROM date_range dr
      LEFT JOIN aggregated a ON a.period = dr.period
      ORDER BY dr.period ASC
      `,
      ...query.params,
    );

    return rows.map((row) => ({
      period: this.toIsoDate(row.period),
      revenuePaid: this.toNumber(row.revenue_paid),
      orders: Number(row.orders),
    }));
  }

  async getTopProducts(
    filters: AnalyticsFilters,
    metric: ProductRankingMetric,
    limit: number,
  ): Promise<TopProduct[]> {
    const orderBy = metric === 'revenue' ? 'revenue_paid DESC' : 'gmv DESC';
    const query = this.buildWhere(filters);
    const limitParam = query.params.length + 1;

    const rows = await this.db.$queryRawUnsafe<TopProductRow[]>(
      `
      SELECT
        p.product_id,
        p.category,
        COALESCE(SUM(fs.item_price), 0) AS gmv,
        COALESCE(SUM(fs.payment_value_allocated), 0) AS revenue_paid,
        COUNT(DISTINCT fs.order_id) AS orders
      FROM gold.fact_sales fs
      JOIN gold.dim_order o ON o.order_key = fs.order_key
      JOIN gold.dim_product p ON p.product_key = fs.product_key
      JOIN gold.dim_customer c ON c.customer_key = fs.customer_key
      WHERE ${query.whereSql}
      GROUP BY p.product_id, p.category
      ORDER BY ${orderBy}
      LIMIT $${limitParam}
      `,
      ...query.params,
      limit,
    );

    return rows.map((row) => ({
      productId: row.product_id,
      category: row.category,
      gmv: this.toNumber(row.gmv),
      revenuePaid: this.toNumber(row.revenue_paid),
      orders: Number(row.orders),
    }));
  }

  private buildWhere(filters: AnalyticsFilters): QueryParts {
    const params: unknown[] = [filters.from, filters.to];
    const conditions: string[] = [
      'o.order_purchase_timestamp >= $1::date',
      "o.order_purchase_timestamp < ($2::date + INTERVAL '1 day')",
    ];

    if (filters.order_status) {
      params.push(filters.order_status);
      conditions.push(`o.status = $${params.length}`);
    }

    if (filters.product_category_name) {
      params.push(filters.product_category_name);
      conditions.push(`p.category = $${params.length}`);
    }

    if (filters.customer_state) {
      params.push(filters.customer_state);
      conditions.push(`c.state = $${params.length}`);
    }

    return {
      whereSql: conditions.join(' AND '),
      params,
    };
  }

  private toNumber(value: NumericValue | null | undefined): number {
    return value ? Number(value) : 0;
  }

  private toIsoDate(value: Date | string): string {
    return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
  }
}
