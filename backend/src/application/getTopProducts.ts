import type {
  AnalyticsFilters,
  AnalyticsRepository,
  ProductRankingMetric,
  TopProduct,
} from '../domain/analytics';

export class GetTopProducts {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  execute(
    filters: AnalyticsFilters,
    metric: ProductRankingMetric,
    limit: number,
  ): Promise<TopProduct[]> {
    return this.analyticsRepository.getTopProducts(filters, metric, limit);
  }
}
