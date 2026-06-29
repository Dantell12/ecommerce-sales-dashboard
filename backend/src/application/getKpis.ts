import type { AnalyticsFilters, AnalyticsRepository, KpiSummary } from '../domain/analytics';

export class GetKpis {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async execute(filters: AnalyticsFilters): Promise<KpiSummary> {
    const [summary, topProductsByGmv, topProductsByRevenue, revenueTrend] = await Promise.all([
      this.analyticsRepository.getKpiSummary(filters),
      this.analyticsRepository.getTopProducts(filters, 'gmv', 10),
      this.analyticsRepository.getTopProducts(filters, 'revenue', 10),
      this.analyticsRepository.getRevenueTrend(filters, 'day'),
    ]);

    return { ...summary, topProductsByGmv, topProductsByRevenue, revenueTrend };
  }
}
