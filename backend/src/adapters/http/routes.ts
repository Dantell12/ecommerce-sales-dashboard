import { Router } from 'express';
import type { GetKpis } from '../../application/getKpis';
import type { GetRevenueTrend } from '../../application/getRevenueTrend';
import type { GetTopProducts } from '../../application/getTopProducts';
import type { KpiResponseDto } from './dtos/KpiResponseDto';
import type { TopProductsResponseDto } from './dtos/TopProductsResponseDto';
import type { TrendResponseDto } from './dtos/TrendResponseDto';
import { parseFilters, parseGrain, parseLimit, parseMetric } from './validation';

interface RouteDependencies {
  getKpis: GetKpis;
  getRevenueTrend: GetRevenueTrend;
  getTopProducts: GetTopProducts;
}

export function createRouter(dependencies: RouteDependencies): Router {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/kpis', async (req, res, next) => {
    try {
      const data: KpiResponseDto = await dependencies.getKpis.execute(parseFilters(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trend/revenue', async (req, res, next) => {
    try {
      const data: TrendResponseDto = await dependencies.getRevenueTrend.execute(
        parseFilters(req),
        parseGrain(req),
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/products/top', async (req, res, next) => {
    try {
      const filters = parseFilters(req);
      const metric = parseMetric(req);
      const limit = parseLimit(req);
      let data: TopProductsResponseDto;

      if (metric === 'all') {
        const [byGmv, byRevenue] = await Promise.all([
          dependencies.getTopProducts.execute(filters, 'gmv', limit),
          dependencies.getTopProducts.execute(filters, 'revenue', limit),
        ]);
        data = { byGmv, byRevenue };
      } else {
        data = await dependencies.getTopProducts.execute(filters, metric, limit);
      }

      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
