import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../../src/adapters/http/app';
import type { AnalyticsRepository } from '../../src/domain/analytics';

const repository: AnalyticsRepository = {
  getKpiSummary: async () => ({
    gmv: 100,
    shipping: 15,
    revenuePaid: 120,
    orders: 2,
    aov: 60,
    itemsPerOrder: 1.5,
    cancellationRate: 0,
    onTimeDeliveryRate: 1,
  }),
  getRevenueTrend: async () => [],
  getTopProducts: async () => [],
};

describe('GET /kpis', () => {
  it('returns the KPI response shape', async () => {
    const response = await request(createApp(repository))
      .get('/kpis')
      .query({ from: '2018-01-01', to: '2018-01-31' })
      .expect(200);

    expect(response.body).toMatchObject({
      gmv: 100,
      shipping: 15,
      revenuePaid: 120,
      orders: 2,
      aov: 60,
      itemsPerOrder: 1.5,
      cancellationRate: 0,
      onTimeDeliveryRate: 1,
      topProductsByGmv: [],
      topProductsByRevenue: [],
      revenueTrend: [],
    });
  });

  it('returns 400 for an invalid date range', async () => {
    const response = await request(createApp(repository))
      .get('/kpis')
      .query({ from: '2018-02-01', to: '2018-01-01' })
      .expect(400);

    expect(response.body).toMatchObject({
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'from must be less than or equal to to',
    });
  });
});
