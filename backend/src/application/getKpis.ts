import type { AnalyticsFilters, AnalyticsRepository, KpiSummary } from '../domain/analytics';

export class GetKpis {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  execute(filters: AnalyticsFilters): Promise<KpiSummary> {
    return this.analyticsRepository.getKpis(filters);
  }
}
