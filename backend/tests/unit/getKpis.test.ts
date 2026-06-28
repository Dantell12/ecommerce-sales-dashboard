import { describe, expect, it } from 'vitest';
import { GetKpis } from '../../src/application/getKpis';
import type { AnalyticsRepository, KpiSummary } from '../../src/domain/analytics';

const emptyKpis: KpiSummary = {
  gmv: 0,
  shipping: 0,
  revenuePaid: 0,
  orders: 0,
  aov: 0,
  itemsPerOrder: 0,
  cancellationRate: 0,
  onTimeDeliveryRate: 0,
};

describe('GetKpis', () => {
  it('returns zero-safe KPIs when the repository has no matching sales', async () => {
    const useCase = new GetKpis(repositoryReturning(emptyKpis));

    await expect(useCase.execute({ from: '2018-01-01', to: '2018-01-31' })).resolves.toEqual(
      emptyKpis,
    );
  });

  it('keeps AOV at 0 when orders are 0', async () => {
    const useCase = new GetKpis(
      repositoryReturning({
        ...emptyKpis,
        revenuePaid: 120,
        orders: 0,
        aov: 0,
      }),
    );

    const result = await useCase.execute({ from: '2018-01-01', to: '2018-01-31' });

    expect(result.aov).toBe(0);
  });

  it('passes date and optional filters to the analytics repository', async () => {
    let receivedFilters: unknown;
    const repository: AnalyticsRepository = {
      getKpis: async (filters) => {
        receivedFilters = filters;
        return emptyKpis;
      },
      getRevenueTrend: async () => [],
      getTopProducts: async () => [],
    };
    const filters = {
      from: '2018-01-01',
      to: '2018-01-31',
      orderStatus: 'delivered',
      productCategory: 'health_beauty',
      customerState: 'SP',
    };

    await new GetKpis(repository).execute(filters);

    expect(receivedFilters).toEqual(filters);
  });
});

function repositoryReturning(kpis: KpiSummary): AnalyticsRepository {
  return {
    getKpis: async () => kpis,
    getRevenueTrend: async () => [],
    getTopProducts: async () => [],
  };
}
