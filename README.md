# Ecommerce Sales Dashboard

Dashboard full-stack para monitorear ventas del dataset publico Brazilian E-Commerce Public Dataset by Olist. El proyecto esta preparado como monorepo con Next.js, Express, PostgreSQL y Prisma, siguiendo la arquitectura requerida en `Prueba_Tecnica.md`.

## Stack

- Frontend: Next.js + TypeScript
- Backend: Node.js + Express + TypeScript, arquitectura hexagonal
- Base de datos: PostgreSQL con schemas `raw`, `clean` y `gold`
- ORM: Prisma sobre el schema analitico `gold`
- Infraestructura: Docker Compose con `frontend`, `backend` y `db`

## Setup

```bash
cp .env.example .env
npm install
npm run prisma:generate --workspace backend
docker compose up -d db
npm run etl:run
npm run dev --workspace backend
npm run dev --workspace frontend
```

URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`
- Healthcheck: `http://localhost:4000/health`

## Docker

```bash
cp .env.example .env
docker compose up --build
```

El ETL puede ejecutarse dentro del backend:

```bash
docker compose exec backend npm run etl:run
```

## Arquitectura

```text
HTTP -> adapters/http -> application/use-cases -> domain ports -> infrastructure/Prisma SQL -> gold.fact_sales
```

Regla critica: el API consulta siempre desde `gold.fact_sales` como driving table. Puede hacer `JOIN` a dimensiones, pero no debe consultar `raw` ni `clean`.

## Modelo Estrella

Grano de `gold.fact_sales`: una fila por item de orden (`order_id` + `order_item_id`).

| Tabla | Tipo | Contenido |
| --- | --- | --- |
| `gold.fact_sales` | Fact | `item_price`, `freight_value`, `payment_value_allocated`, flags de entrega/cancelacion y FKs |
| `gold.dim_date` | Dimension | Calendario |
| `gold.dim_customer` | Dimension | Cliente, ciudad y estado |
| `gold.dim_product` | Dimension | Producto y categoria |
| `gold.dim_order` | Dimension | Orden, status y timestamps |

## KPIs

- GMV: suma de `item_price`.
- Shipping: suma de `freight_value`, mostrado aparte.
- Revenue Paid: suma de `payment_value_allocated`.
- Orders: `COUNT(DISTINCT order_id)`.
- AOV: `Revenue Paid / Orders`, con 0 si no hay ordenes.
- Items per Order: `COUNT(order_item_id) / Orders`.
- Cancellation Rate: ordenes canceladas sobre total de ordenes. No se incluye `unavailable` como cancelada.
- On-Time Delivery: entre ordenes entregadas, entregas con `delivered_customer_date <= estimated_delivery_date`.
- Top Products: ranking por GMV o Revenue.
- Revenue Trend: serie por dia o semana.

## Regla de Asignacion de Pagos

Olist tiene pagos a nivel orden, pero la fact esta a nivel item. Para construir `gold.fact_sales`, el ETL reparte el pago de la orden en partes iguales entre sus items:

```text
payment_value_allocated = total_payment_by_order / item_count_by_order
```

Esta regla conserva el total de revenue por orden y permite agregar revenue desde el grano item.

## Scripts

```bash
npm run lint
npm test
npm run test:integration
npm run etl:run
```

## Dataset

El ETL descarga los CSV desde el mirror publico de GitHub configurado en `OLIST_DATASET_BASE_URL` y los guarda en `backend/data/raw`. Los CSV no se versionan.
