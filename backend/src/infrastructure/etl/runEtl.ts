import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Client } from 'pg';

type DatasetFile = {
  fileName: string;
  tableName: string;
  columns: string[];
};

const datasetFiles: DatasetFile[] = [
  {
    fileName: 'olist_orders_dataset.csv',
    tableName: 'raw.orders',
    columns: [
      'order_id',
      'customer_id',
      'order_status',
      'order_purchase_timestamp',
      'order_approved_at',
      'order_delivered_carrier_date',
      'order_delivered_customer_date',
      'order_estimated_delivery_date',
    ],
  },
  {
    fileName: 'olist_order_items_dataset.csv',
    tableName: 'raw.order_items',
    columns: [
      'order_id',
      'order_item_id',
      'product_id',
      'seller_id',
      'shipping_limit_date',
      'price',
      'freight_value',
    ],
  },
  {
    fileName: 'olist_order_payments_dataset.csv',
    tableName: 'raw.order_payments',
    columns: ['order_id', 'payment_sequential', 'payment_type', 'payment_installments', 'payment_value'],
  },
  {
    fileName: 'olist_customers_dataset.csv',
    tableName: 'raw.customers',
    columns: [
      'customer_id',
      'customer_unique_id',
      'customer_zip_code_prefix',
      'customer_city',
      'customer_state',
    ],
  },
  {
    fileName: 'olist_products_dataset.csv',
    tableName: 'raw.products',
    columns: [
      'product_id',
      'product_category_name',
      'product_name_lenght',
      'product_description_lenght',
      'product_photos_qty',
      'product_weight_g',
      'product_length_cm',
      'product_height_cm',
      'product_width_cm',
    ],
  },
  {
    fileName: 'product_category_name_translation.csv',
    tableName: 'raw.product_category_name_translation',
    columns: ['product_category_name', 'product_category_name_english'],
  },
];

const projectRoot = path.resolve(__dirname, '../../..');
const migrationsDir = path.join(projectRoot, 'src/infrastructure/database/migrations');
const rawDataDir = path.join(projectRoot, 'data/raw');
const datasetBaseUrl =
  process.env.OLIST_DATASET_BASE_URL ??
  'https://raw.githubusercontent.com/olist/work-at-olist-data/master/datasets';

async function main(): Promise<void> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL ?? process.env.LOCAL_DATABASE_URL,
  });

  await client.connect();

  try {
    await runMigrationFiles(client, ['001_create_schemas.sql', '002_create_raw_tables.sql']);
    await ensureDatasetFiles();
    await loadRawTables(client);
    await runMigrationFiles(client, [
      '003_create_clean_tables.sql',
      '004_create_gold_tables.sql',
      '005_build_clean_and_gold.sql',
    ]);
  } finally {
    await client.end();
  }
}

async function runMigrationFiles(client: Client, fileNames: string[]): Promise<void> {
  for (const fileName of fileNames) {
    const sql = await fs.readFile(path.join(migrationsDir, fileName), 'utf8');
    console.log(`Running migration ${fileName}`);
    await client.query(sql);
  }
}

async function ensureDatasetFiles(): Promise<void> {
  await fs.mkdir(rawDataDir, { recursive: true });

  for (const datasetFile of datasetFiles) {
    const outputPath = path.join(rawDataDir, datasetFile.fileName);

    try {
      await fs.access(outputPath);
      continue;
    } catch {
      const url = `${datasetBaseUrl}/${datasetFile.fileName}`;
      console.log(`Downloading ${url}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Could not download ${url}: ${response.status} ${response.statusText}`);
      }

      await fs.writeFile(outputPath, await response.text(), 'utf8');
    }
  }
}

async function loadRawTables(client: Client): Promise<void> {
  for (const datasetFile of datasetFiles) {
    const csvPath = path.join(rawDataDir, datasetFile.fileName);
    const csv = await fs.readFile(csvPath, 'utf8');
    const [header, ...rows] = parseCsv(csv);
    const headerIndex = new Map(header.map((column, index) => [column, index]));
    const selectedRows = rows.filter((row) => row.length > 1);

    console.log(`Loading ${selectedRows.length} rows into ${datasetFile.tableName}`);
    await client.query(`TRUNCATE ${datasetFile.tableName}`);

    for (let index = 0; index < selectedRows.length; index += 1000) {
      const batch = selectedRows.slice(index, index + 1000);
      const values: Array<string | null> = [];
      const placeholders = batch.map((row, rowIndex) => {
        const rowPlaceholders = datasetFile.columns.map((column, columnIndex) => {
          const csvIndex = headerIndex.get(column);
          const value = csvIndex === undefined ? null : row[csvIndex] || null;
          values.push(value);
          return `$${rowIndex * datasetFile.columns.length + columnIndex + 1}`;
        });

        return `(${rowPlaceholders.join(', ')})`;
      });

      await client.query(
        `INSERT INTO ${datasetFile.tableName} (${datasetFile.columns.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values,
      );
    }
  }
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];

    if (char === '"' && insideQuotes && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
