import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed(): Promise<void> {
  const count = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) FROM gold.fact_sales
  `;

  if (Number(count[0]?.count ?? 0) === 0) {
    console.log('No hay datos en gold.fact_sales. Ejecuta: npm run etl:run');
    process.exitCode = 1;
    return;
  }

  console.log(`Seed OK: ${count[0].count} filas en gold.fact_sales`);
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
