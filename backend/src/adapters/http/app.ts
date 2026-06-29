import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { GetKpis } from '../../application/getKpis';
import { GetRevenueTrend } from '../../application/getRevenueTrend';
import { GetTopProducts } from '../../application/getTopProducts';
import type { AnalyticsRepository } from '../../domain/analytics';
import type { ErrorDto } from './dtos/ErrorDto';
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
  app.use((_req, res) => {
    res.status(404).json({ statusCode: 404, code: 'NOT_FOUND', message: 'Ruta no encontrada' });
  });
  app.use(errorHandler);

  return app;
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  void _next;

  if (error instanceof HttpError) {
    const body: ErrorDto = {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    };

    res.status(error.statusCode).json(body);
    return;
  }

  console.error(error);
  res
    .status(500)
    .json({ statusCode: 500, code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
};
