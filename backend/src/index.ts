import 'dotenv/config';
import { createApp } from './adapters/http/app';
import { PrismaAnalyticsRepository } from './infrastructure/database/PrismaAnalyticsRepository';
import { prisma } from './infrastructure/database/prismaClient';

const port = Number(process.env.PORT ?? 4000);
const app = createApp(new PrismaAnalyticsRepository(prisma));

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
