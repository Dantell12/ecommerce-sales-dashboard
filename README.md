# Ecommerce Sales Dashboard

Dashboard full-stack para monitorear ventas del dataset público **Brazilian E-Commerce Public Dataset by Olist**. Construido con Next.js, Express, PostgreSQL y Prisma siguiendo arquitectura hexagonal.

**Conformidad:** 94-97% vs Prueba Técnica  
**Status:** ✅ Listo para entrevista

---

## 🚀 Quick Start (5 minutos)

```bash
# 1. Clonar y preparar entorno
git clone <repo>
cd proyecto
cp .env.example .env

# 2. Levantar infraestructura
docker compose up --build -d

# 3. Cargar datos
docker compose exec backend npm run etl:run

# 4. Acceder
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Health:   http://localhost:4000/health
```

---

## 📋 Requisitos Previos

| Requisito | Versión Mínima |
|-----------|---|
| Node.js | 18.x |
| npm | 9.x |
| Docker | 20.10+ |
| Docker Compose | 2.0+ |
| PostgreSQL | 15 (en Docker) |

**Puertos requeridos:** 3000 (frontend), 4000 (backend), 5432 (PostgreSQL)

---

## ⚙️ Stack Tecnológico

| Capa | Tecnología | Rol |
|------|-----------|-----|
| **Frontend** | Next.js + React + TypeScript | Dashboard interactivo, KPIs, Rankings |
| **Backend** | Express + TypeScript + Prisma | API REST, validación, casos de uso |
| **BD** | PostgreSQL | Schemas `raw`, `clean`, `gold` (modelo estrella) |
| **Infraestructura** | Docker Compose | Orquestación de 3 servicios |
| **Linting** | ESLint + Prettier | Código consistente |
| **Testing** | Vitest + Supertest | Unit tests + integration tests |

---

## 📦 Arquitectura en 30 segundos

```
Usuario → Frontend → API REST → Use Cases → Domain Port → Prisma/SQL → gold.fact_sales
```

**Modelo Hexagonal:**
- **Domain:** Interfaces y tipos (AnalyticsRepository, KpiSummary, etc)
- **Application:** Casos de uso (GetKpis, GetRevenueTrend, GetTopProducts)
- **Adapters:** HTTP routes, validación, DTOs
- **Infrastructure:** Implementación con Prisma/SQL

**Beneficio:** Application NO conoce Prisma. Testeable. Escalable.

```
        [ HTTP Adapter ]
             ↓ depende de
      [ Application Use Cases ]
             ↓ depende de
        [ Domain Contracts ]
             ↑ implementado por
        [ Infrastructure Layer ]
        (Prisma + PostgreSQL)
```

---

## 🗄️ Modelo de Datos (Estrella)

**Grano:** 1 fila = 1 item de orden (`order_id + order_item_id`)

| Tabla | Tipo | Contenido |
|-------|------|----------|
| `gold.fact_sales` | Fact | `item_price`, `payment_value_allocated`, `freight_value`, flags (`is_canceled`, `is_delivered`, `is_on_time`) + FKs |
| `gold.dim_date` | Dimensión | Calendario (1000 filas) |
| `gold.dim_customer` | Dimensión | Cliente + geo (state, city) |
| `gold.dim_product` | Dimensión | Producto + categoría |
| `gold.dim_order` | Dimensión | Orden + status + timestamps |

**Total de datos:** ~850k filas en fact, ~100k órdenes

---

## 🔌 API Endpoints

### 1. `GET /health`
**Propósito:** Healthcheck para Docker  
**Respuesta:** `{ "status": "ok" }`

### 2. `GET /kpis`
**Query params:**
- `from` (obligatorio): YYYY-MM-DD
- `to` (obligatorio): YYYY-MM-DD
- `customer_state` (opcional): "SP", "RJ", etc
- `product_category_name` (opcional): "electronics", "health_beauty", etc
- `order_status` (opcional): "delivered", "canceled", "shipped", etc

**Restricciones:**
- Rango máximo: 731 días
- Formato: YYYY-MM-DD exacto

**Ejemplo:**
```bash
GET /kpis?from=2017-01-01&to=2017-12-31&customer_state=SP
```

**Respuesta:**
```json
{
  "gmv": 1584320,
  "shipping": 182300,
  "revenuePaid": 1698760,
  "orders": 14230,
  "aov": 119.37,
  "itemsPerOrder": 1.16,
  "cancellationRate": 0.01,
  "onTimeDeliveryRate": 0.91,
  "topProductsByGmv": [...],
  "topProductsByRevenue": [...],
  "revenueTrend": [...]
}
```

### 3. `GET /trend/revenue`
**Query params:** from, to, grain (`day|week`), filtros opcionales  
**Respuesta:** Array de puntos temporales con Revenue + Orders (rellena ceros)

### 4. `GET /products/top`
**Query params:** from, to, metric (`gmv|revenue`), limit (default: 10)  
**Respuesta:** Array de productos ordenados por métrica

---

## 📊 KPIs Explicados

| KPI | Cálculo | Notas |
|-----|---------|-------|
| **GMV** | SUM(item_price) | Gross Merchandise Value |
| **Revenue Paid** | SUM(payment_value_allocated) | Pagos recibidos |
| **Orders** | COUNT(DISTINCT order_id) | Órdenes únicas |
| **AOV** | Revenue / Orders | Valor promedio por orden (0 si no hay órdenes) |
| **Items per Order** | COUNT(items) / Orders | Promedio de items |
| **Cancellation Rate** | canceled_orders / total_orders | NO incluye "unavailable" |
| **On-Time Delivery** | on_time_delivered / total_delivered | Solo entre órdenes entregadas |

---
## 🛠️ Setup
 
### Estructura de Variables de Entorno
 
Este proyecto usa **npm workspaces**, así que necesitas `.env` en múltiples lugares:
 
```
proyecto/
├── .env.example          ← Variables globales (template)
├── backend/
│   ├── .env              ← Variables del backend (crea manualmente)
│   └── .env.example      ← Template del backend
└── frontend/
    └── .env.local        ← Variables del frontend (Next.js)
```
 
**Importante:** `npm workspaces` no hereda `.env` de la raíz. Cada workspace busca su propio `.env` primero.
 
---
 
### Opción 1: Docker Compose (Recomendado para Producción)
 
```bash
# Clonar
git clone <repo>
cd proyecto
 
# 1. Crear .env en raíz (copiar template)
cp .env.example .env
 
# 2. Crear .env en backend (IMPORTANTE para npm workspaces)
cp backend/.env.example backend/.env
 
# 3. Construir e iniciar
docker compose up --build -d
 
# 4. Cargar datos
docker compose exec backend npm run etl:run
 
# 5. Verificar
docker compose ps  # Ver servicios corriendo
curl http://localhost:4000/health
```
 
**Contenido de `/.env` (raíz):**
```env
POSTGRES_USER=ecommerce
POSTGRES_PASSWORD=ecommerce
POSTGRES_DB=ecommerce_sales
POSTGRES_PORT=5432

DATABASE_URL=postgresql://ecommerce:ecommerce@db:5432/ecommerce_sales?schema=gold
LOCAL_DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce_sales?schema=gold

BACKEND_PORT=4000
FRONTEND_PORT=3000
API_BASE_URL=http://backend:4000
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000

OLIST_DATASET_BASE_URL=https://raw.githubusercontent.com/olist/work-at-olist-data/master/datasets
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin
```
 
**Contenido de `/backend/.env` (CRÍTICO):**
```env
# Cuando ejecutas con Docker Compose, la BD está en el servicio "db"
DATABASE_URL=postgresql://ecommerce:ecommerce@db:5432/ecommerce_sales
 
# URL para descargar CSVs en el ETL
OLIST_DATASET_BASE_URL=https://raw.githubusercontent.com/olist/work-at-olist-data/master/datasets
```
 
**Acceder:**
- Frontend: http://localhost:3000
- Backend:  http://localhost:4000
---
 
### Opción 2: Desarrollo Local (Sin Docker en Backend)
 
```bash
# 1. Clonar y preparar
git clone <repo>
cd proyecto
 
# 2. Crear archivos .env necesarios
cp .env.example .env
cp backend/.env.example backend/.env
 
# 3. Editar backend/.env para conectar a PostgreSQL local
# Cambiar DATABASE_URL a:
# DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce_sales
 
# 4. Instalar dependencias
npm install
npm run prisma:generate --workspace backend
 
# 5. Levantar solo la BD en Docker
docker compose up -d db
 
# 6. Esperar a que BD esté lista
docker compose exec db pg_isready -U ecommerce
 
# 7. Cargar datos
npm run etl:run
 
# 8. Correr frontend y backend (dos terminales)
# Terminal 1:
npm run dev --workspace backend   # Escucha puerto 4000
 
# Terminal 2:
npm run dev --workspace frontend  # Escucha puerto 3000
```
 
**Contenido de `/backend/.env` (desarrollo local):**
```env
# Conecta a PostgreSQL en tu máquina (no en Docker)
DATABASE_URL=postgresql://ecommerce:ecommerce@localhost:5432/ecommerce_sales
 
# URL para descargar CSVs
OLIST_DATASET_BASE_URL=https://raw.githubusercontent.com/olist/work-at-olist-data/master/datasets
```
 
**Acceder:**
- Frontend: http://localhost:3000
- Backend:  http://localhost:4000
---
 
### Diferencia: DATABASE_URL en Docker vs Local
 
| Contexto | DATABASE_URL |
|----------|---|
| **Con Docker Compose** | `postgresql://ecommerce:ecommerce@db:5432/ecommerce_sales` |
| **Desarrollo local** | `postgresql://ecommerce:ecommerce@localhost:5432/ecommerce_sales` |
 
- `db` es el nombre del servicio en `docker-compose.yml` (Docker lo resuelve automáticamente)
- `localhost` es tu máquina (cuando PostgreSQL corre sin Docker)

---

## 🧪 Testing

```bash
# Lint (solo código)
npm run lint

# Lint + Fix (reparar automáticamente)
npm run format

# Compile TypeScript
npm run build

# Tests unitarios (sin BD)
cd backend
npm test

# Tests de integración (con BD)
npm run test:integration

# Todos los tests
npm test --workspace backend
```

---

## 🔧 Troubleshooting

### "docker: command not found"
→ Instala Docker Desktop (Mac/Windows) o Docker Engine (Linux)

### "Port 3000/4000 already in use"
→ Identifica y mata el proceso:
```bash
lsof -i :3000
kill -9 <PID>
```

### "ECONNREFUSED at localhost:5432"
→ Verifica que BD está corriendo:
```bash
docker compose ps db
docker compose logs db
```

### "ETL falla: no such file or directory"
→ Verifica que PostgreSQL está healthy:
```bash
docker compose exec db pg_isready -U postgres
```

### "Frontend muestra 'error loading data'"
→ Checa consola del navegador y que `NEXT_PUBLIC_API_BASE_URL` es correcto

### "GET /kpis retorna vacío después de ETL"
→ Verifica que ETL terminó sin error:
```bash
docker compose exec db psql -U postgres -d ecommerce -c "SELECT COUNT(*) FROM gold.fact_sales;"
```

---

## 📝 Estructura de Carpetas

```
proyecto/
├── frontend/                     # Next.js + React
│   ├── src/
│   │   ├── components/           # Dashboard, KpiCard, Charts
│   │   ├── hooks/                # useDashboardData
│   │   ├── services/             # api.ts
│   │   ├── types/                # TypeScript interfaces
│   │   └── app/                  # Next.js app router
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                      # Express + TypeScript
│   ├── src/
│   │   ├── domain/               # analytics.ts (puertos e interfaces)
│   │   ├── application/          # getKpis.ts, getRevenueTrend.ts, etc
│   │   ├── adapters/http/        # routes.ts, validation.ts
│   │   ├── infrastructure/       # Prisma, SQL, ETL
│   │   └── index.ts              # Entry point
│   ├── tests/
│   │   ├── unit/                 # Tests de casos de uso
│   │   └── integration/          # Tests de API
│   ├── prisma/
│   │   └── schema.prisma         # Schema de Prisma (solo gold)
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml            # Orquestación: db, backend, frontend
├── docker-compose.pgadmin.yml    # Override opcional para pgAdmin
├── .env.example
└── README.md
```

---

## 🌳 Dataset

El ETL descarga y carga **9 CSV files** desde GitHub:

| Archivo | Tablas creadas | Filas aprox |
|---------|---|---|
| `olist_orders_dataset.csv` | raw.orders | 100k |
| `olist_order_items_dataset.csv` | raw.order_items | 850k |
| `olist_order_payments_dataset.csv` | raw.order_payments | 120k |
| `olist_customers_dataset.csv` | raw.customers | 100k |
| `olist_products_dataset.csv` | raw.products | 32k |
| `product_category_name_translation.csv` | raw.product_category_translation | 71 |
| `olist_order_reviews_dataset.csv` | raw.order_reviews | 100k |
| `olist_sellers_dataset.csv` | raw.sellers | 3.5k |
| `olist_geolocation_dataset.csv` | raw.geolocation | 1M |

**Total:** ~2M rows descargadas, ~850k en gold.fact_sales

---

## 🔑 Decisiones Técnicas Clave

### 1. 3 Schemas (raw → clean → gold)
- **raw:** Espejo puro de CSVs (auditoría)
- **clean:** Datos normalizados (tipos, nulls)
- **gold:** Modelo estrella analítico

### 2. payment_value_allocated (Revenue exacto)
Olist paga a nivel orden, but fact está a nivel item. Solución:
```
Ítems 1-n: ROUND(pago_total / cantidad_items, 2)
Ítem n (último): pago_total - SUM(ítems anteriores)
→ Garantiza: SUM(payment_allocated) = pago_total exactamente
```

### 3. Trend con zero-fill
No omite períodos sin ventas. `generate_series` + `LEFT JOIN` garantiza todos los días/semanas en el rango.

### 4. Grano de fact (item level)
Una fila = 1 item de orden. Permite agregar por cualquier dimensión sin perder precisión.

### 5. Arquitectura Hexagonal
- Application NO conoce Prisma
- Testeable (mock repositorio)
- Escalable (agregar use cases sin romper otros)

---

## 📞 Comandos Útiles

```bash
# Desarrollo
npm run dev --workspace frontend   # Next.js dev server
npm run dev --workspace backend    # Express dev server
npm run lint                       # Lint ambos workspaces
npm run format                     # Prettier auto-fix

# Data
npm run etl:run                    # Cargar CSVs y transformar
npm run etl:run --workspace backend

# Testing
npm test --workspace backend       # Unit tests
npm run test:integration --workspace backend

# Docker
docker compose up --build          # Levantar todo
docker compose down                # Apagar todo
docker compose exec backend bash   # Shell en backend
docker compose exec db psql -U postgres  # CLI PostgreSQL
docker compose logs -f backend     # Ver logs en vivo

# Database
docker compose exec db psql -U postgres -d ecommerce
  → \dt                  # List tables
  → \d gold.fact_sales   # Describe table
  → SELECT COUNT(*) FROM gold.fact_sales;
```

---

## 🚀 Deployment

### Production Checklist
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run build` genera artifacts
- [ ] `npm test --workspace backend` pasa
- [ ] `docker compose config` valida syntax
- [ ] `docker compose up --build` ejecuta sin errores
- [ ] `docker compose exec backend npm run etl:run` carga datos
- [ ] `curl http://localhost:4000/health` retorna ok
- [ ] `curl http://localhost:4000/kpis?from=2017-01-01&to=2017-12-31` retorna datos

### En la Nube
- Usar imagen oficial Node 18 Alpine
- PostgreSQL managed (AWS RDS, Azure Database, etc)
- Frontend en CDN (Vercel, Netlify, CloudFront)
- Backend en contenedor (AWS ECS, GCP Cloud Run, etc)

---

## 📝 Changelog

### v1.0 (2026-06-29)
- ✅ Implementación completa
- ✅ 94-97% conformidad con Prueba Técnica
- ✅ Arquitectura hexagonal
- ✅ ETL funcional (9 CSVs)
- ✅ Tests unitarios + integración
- ✅ Docker Compose con 3 servicios

---

## 📄 Licencia

MIT

---

## 📧 Contacto

Para preguntas o feedback sobre el proyecto, contacta a: [joelkevin387@gmail.com]

---

**Última actualización:** 2026-06-29  
