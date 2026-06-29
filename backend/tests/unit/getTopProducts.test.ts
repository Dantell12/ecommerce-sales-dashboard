import { describe, expect, it } from 'vitest';
import { GetTopProducts } from '../../src/application/getTopProducts';
import type {
  AnalyticsRepository,
  ProductRankingMetric,
  TopProduct,
} from '../../src/domain/analytics';

const products: TopProduct[] = [
  {
    productId: 'abc123',
    category: 'health_beauty',
    gmv: 300,
    revenuePaid: 280,
    orders: 4,
  },
];

describe('GetTopProducts', () => {
  it('returns top products provided by the analytics repository', async () => {
    const useCase = new GetTopProducts(repositoryReturning(products));

    await expect(
      useCase.execute({ from: '2018-01-01', to: '2018-01-31' }, 'gmv', 10),
    ).resolves.toEqual(products);
  });

  it('passes filters, metric and limit to the analytics repository', async () => {
    let receivedFilters: unknown;
    let receivedMetric: ProductRankingMetric | undefined;
    let receivedLimit: number | undefined;
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
      getRevenueTrend: async () => [],
      getTopProducts: async (filters, metric, limit) => {
        receivedFilters = filters;
        receivedMetric = metric;
        receivedLimit = limit;
        return products;
      },
    };
    const filters = {
      from: '2018-01-01',
      to: '2018-01-31',
      order_status: 'delivered',
      product_category_name: 'health_beauty',
      customer_state: 'SP',
    };

    await new GetTopProducts(repository).execute(filters, 'revenue', 25);

    expect(receivedFilters).toEqual(filters);
    expect(receivedMetric).toBe('revenue');
    expect(receivedLimit).toBe(25);
  });
});

function repositoryReturning(topProducts: TopProduct[]): AnalyticsRepository {
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
    getRevenueTrend: async () => [],
    getTopProducts: async () => topProducts,
  };
}
