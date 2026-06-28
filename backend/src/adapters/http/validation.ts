import type { Request } from 'express';
import type { AnalyticsFilters, DateGrain, ProductRankingMetric } from '../../domain/analytics';

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(req: Request): AnalyticsFilters {
  const from = readString(req.query.from);
  const to = readString(req.query.to);

  if (!from || !to) {
    throw new HttpError(400, 'from and to are required query params in YYYY-MM-DD format');
  }

  if (!isoDatePattern.test(from) || !isoDatePattern.test(to)) {
    throw new HttpError(400, 'from and to must use YYYY-MM-DD format');
  }

  if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    throw new HttpError(400, 'from and to must be valid dates');
  }

  if (from > to) {
    throw new HttpError(400, 'from must be less than or equal to to');
  }

  return {
    from,
    to,
    orderStatus: readString(req.query.orderStatus),
    productCategory: readString(req.query.productCategory),
    customerState: readString(req.query.customerState),
  };
}

export function parseGrain(req: Request): DateGrain {
  const grain = readString(req.query.grain) ?? 'day';

  if (grain !== 'day' && grain !== 'week') {
    throw new HttpError(400, 'grain must be day or week');
  }

  return grain;
}

export function parseMetric(req: Request): ProductRankingMetric {
  const metric = readString(req.query.metric) ?? 'gmv';

  if (metric !== 'gmv' && metric !== 'revenue') {
    throw new HttpError(400, 'metric must be gmv or revenue');
  }

  return metric;
}

export function parseLimit(req: Request): number {
  const rawLimit = readString(req.query.limit);
  const limit = rawLimit ? Number(rawLimit) : 10;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, 'limit must be an integer between 1 and 100');
  }

  return limit;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  return undefined;
}
