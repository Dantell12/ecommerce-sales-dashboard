import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { GetKpis } from '../../application/getKpis';
import { GetRevenueTrend } from '../../application/getRevenueTrend';
import { GetTopProducts } from '../../application/getTopProducts';
import type { AnalyticsRepository } from '../../domain/analytics';
import { createRouter } from './routes';
import { HttpError } from './validation';

export function createApp(analyticsRepository: AnalyticsRepository) {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(
    createRouter({
      getKpis: new GetKpis(analyticsRepository),
      getRevenueTrend: new GetRevenueTrend(analyticsRepository),
      getTopProducts: new GetTopProducts(analyticsRepository),
    }),
  );
  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ error: error.message });
    return;
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
};
