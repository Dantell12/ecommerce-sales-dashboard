import { Router } from 'express';
import type { GetKpis } from '../../application/getKpis';
import type { GetRevenueTrend } from '../../application/getRevenueTrend';
import type { GetTopProducts } from '../../application/getTopProducts';
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
      const data = await dependencies.getKpis.execute(parseFilters(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/trend/revenue', async (req, res, next) => {
    try {
      const data = await dependencies.getRevenueTrend.execute(parseFilters(req), parseGrain(req));
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  router.get('/products/top', async (req, res, next) => {
    try {
      const data = await dependencies.getTopProducts.execute(
        parseFilters(req),
        parseMetric(req),
        parseLimit(req),
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
