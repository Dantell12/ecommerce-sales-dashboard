import type {
  AnalyticsFilters,
  KpiSummary,
  RevenueTrendPoint,
  TopProduct,
} from '@/types/analytics';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

type RequestParams = Partial<AnalyticsFilters> & {
  grain?: 'day' | 'week';
  metric?: 'gmv' | 'revenue';
  limit?: string;
};

export async function fetchKpis(filters: AnalyticsFilters): Promise<KpiSummary> {
  return request<KpiSummary>('/kpis', filters);
}

export async function fetchRevenueTrend(
  filters: AnalyticsFilters,
  grain: 'day' | 'week',
): Promise<RevenueTrendPoint[]> {
  return request<RevenueTrendPoint[]>('/trend/revenue', { ...filters, grain });
}

export async function fetchTopProducts(
  filters: AnalyticsFilters,
  metric: 'gmv' | 'revenue',
  limit = 10,
): Promise<TopProduct[]> {
  return request<TopProduct[]>('/products/top', { ...filters, metric, limit: String(limit) });
}

async function request<T>(pathname: string, params: RequestParams): Promise<T> {
  const url = new URL(pathname, apiBaseUrl);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url, { cache: 'no-store' });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
