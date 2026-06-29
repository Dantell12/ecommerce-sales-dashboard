import { describe, expect, it } from 'vitest';
import { GetRevenueTrend } from '../../src/application/getRevenueTrend';
import type { AnalyticsRepository, DateGrain, RevenueTrendPoint } from '../../src/domain/analytics';

const trend: RevenueTrendPoint[] = [
  { period: '2018-01-01', revenuePaid: 120, orders: 2 },
  { period: '2018-01-02', revenuePaid: 0, orders: 0 },
];

describe('GetRevenueTrend', () => {
  it('returns the revenue trend provided by the analytics repository', async () => {
    const useCase = new GetRevenueTrend(repositoryReturning(trend));

    await expect(useCase.execute({ from: '2018-01-01', to: '2018-01-02' }, 'day')).resolves.toEqual(
      trend,
    );
  });

  it('passes filters and grain to the analytics repository', async () => {
    let receivedFilters: unknown;
    let receivedGrain: DateGrain | undefined;
    const repository: AnalyticsRepository = {
      getKpiSummary: async () => ({
        gmv: 0,
        shipping: 0,
        revenuePaid: 0,
        orders: 0,
        aov: 0,
        itemsPerOrder: 0,
        cancellationRate: 0,
        onTimeDeliveryRate: 0,
      }),
      getRevenueTrend: async (filters, grain) => {
        receivedFilters = filters;
        receivedGrain = grain;
        return trend;
      },
      getTopProducts: async () => [],
    };
    const filters = {
      from: '2018-01-01',
      to: '2018-01-31',
      order_status: 'delivered',
      product_category_name: 'health_beauty',
      customer_state: 'SP',
    };

    await new GetRevenueTrend(repository).execute(filters, 'week');

    expect(receivedFilters).toEqual(filters);
    expect(receivedGrain).toBe('week');
  });
});

function repositoryReturning(revenueTrend: RevenueTrendPoint[]): AnalyticsRepository {
  return {
    getKpiSummary: async () => ({
      gmv: 0,
      shipping: 0,
      revenuePaid: 0,
      orders: 0,
      aov: 0,
      itemsPerOrder: 0,
      cancellationRate: 0,
      onTimeDeliveryRate: 0,
    }),
    getRevenueTrend: async () => revenueTrend,
    getTopProducts: async () => [],
  };
}
