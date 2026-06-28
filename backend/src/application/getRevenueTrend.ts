import type {
  AnalyticsFilters,
  AnalyticsRepository,
  DateGrain,
  RevenueTrendPoint,
} from '../domain/analytics';

export class GetRevenueTrend {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  execute(filters: AnalyticsFilters, grain: DateGrain): Promise<RevenueTrendPoint[]> {
    return this.analyticsRepository.getRevenueTrend(filters, grain);
  }
}
