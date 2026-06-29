import type { Request } from 'express';
import type {
  AnalyticsFilters,
  DateGrain,
  ProductRankingRequestMetric,
} from '../../domain/analytics';

export const MAX_DATE_RANGE_DAYS = 731;

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code = 'BAD_REQUEST',
    public readonly details?: unknown,
  ) {
    super(message);
  }
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export function parseFilters(req: Request): AnalyticsFilters {
  const from = readString(req.query.from);
  const to = readString(req.query.to);

  if (!from || !to) {
    throw new HttpError(
      400,
      'from and to are required query params in YYYY-MM-DD format',
      'VALIDATION_ERROR',
    );
  }

  if (!isoDatePattern.test(from) || !isoDatePattern.test(to)) {
    throw new HttpError(400, 'from and to must use YYYY-MM-DD format', 'VALIDATION_ERROR');
  }

  if (Number.isNaN(Date.parse(from)) || Number.isNaN(Date.parse(to))) {
    throw new HttpError(400, 'from and to must be valid dates', 'VALIDATION_ERROR');
  }

  if (from > to) {
    throw new HttpError(400, 'from must be less than or equal to to', 'VALIDATION_ERROR');
  }

  const rangeDays = daysBetween(from, to);

  if (rangeDays > MAX_DATE_RANGE_DAYS) {
    throw new HttpError(
      400,
      `El rango de fechas no puede superar ${MAX_DATE_RANGE_DAYS} dias`,
      'DATE_RANGE_TOO_LARGE',
      { maxDays: MAX_DATE_RANGE_DAYS },
    );
  }

  return {
    from,
    to,
    order_status: readString(req.query.order_status),
    product_category_name: readString(req.query.product_category_name),
    customer_state: readString(req.query.customer_state),
  };
}

export function parseGrain(req: Request): DateGrain {
  const grain = readString(req.query.grain) ?? 'day';

  if (grain !== 'day' && grain !== 'week') {
    throw new HttpError(400, 'grain must be day or week', 'VALIDATION_ERROR');
  }

  return grain;
}

export function parseMetric(req: Request): ProductRankingRequestMetric {
  const metric = readString(req.query.metric) ?? 'all';

  if (metric !== 'gmv' && metric !== 'revenue' && metric !== 'all') {
    throw new HttpError(400, 'metric must be gmv, revenue or all', 'VALIDATION_ERROR');
  }

  return metric;
}

export function parseLimit(req: Request): number {
  const rawLimit = readString(req.query.limit);
  const limit = rawLimit ? Number(rawLimit) : 10;

  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HttpError(400, 'limit must be an integer between 1 and 100', 'VALIDATION_ERROR');
  }

  return limit;
}

function daysBetween(from: string, to: string): number {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const fromTime = Date.parse(`${from}T00:00:00.000Z`);
  const toTime = Date.parse(`${to}T00:00:00.000Z`);

  return Math.floor((toTime - fromTime) / millisecondsPerDay) + 1;
}

function readString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim();
  }

  return undefined;
}
