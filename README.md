# 📊 E-Commerce Sales Analytics & Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue?style=flat&logo=react)](https://reactjs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey?style=flat&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker)](https://www.docker.com/)
[![Vitest](https://img.shields.io/badge/Testing-Vitest-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Dashboard analítico full-stack de alto rendimiento para monitorear, analizar y proyectar el desempeño comercial sobre el **Brazilian E-Commerce Public Dataset by Olist** (~100k órdenes, ~112k ítems de venta). 

Diseñado bajo principios de ingeniería de software robustos: **Arquitectura Hexagonal (Ports & Adapters)** en el backend, **Arquitectura Medallón (Capas Raw → Clean → Gold / Star Schema)** en PostgreSQL y un frontend interactivo moderno en **Next.js 14**.

---

## 🌐 Live Demo en Producción

* **Frontend Dashboard (Vercel):** [https://ecommerce-sales-dashboard-frontend.vercel.app/](https://ecommerce-sales-dashboard-frontend.vercel.app/)
* **Backend API (Render):** [https://ecommerce-sales-dashboard-backend.onrender.com/health](https://ecommerce-sales-dashboard-backend.onrender.com/health)
* **Base de Datos (Supabase):** PostgreSQL Serverless en la nube con esquemas `raw`, `clean` y `gold` cargados.

---

## 🚀 Quick Start con Docker (5 minutos)

Para levantar el entorno completo de forma local con Docker Compose (Frontend, Backend y Base de Datos):

```bash
# 1. Clonar el repositorio
git clone https://github.com/Dantell12/ecommerce-sales-dashboard.git
cd ecommerce-sales-dashboard

# 2. Configurar variables de entorno
cp .env.example .env

# 3. Levantar infraestructura en contenedores
docker compose up --build -d

# 4. Ejecutar el pipeline ETL automatizado (descarga datos y puebla Postgres)
docker compose exec backend npm run etl:run

# 5. Acceder a las aplicaciones locales:
# Frontend: http://localhost:3000
# Backend:  http://localhost:4000
# Health:   http://localhost:4000/health
```

---

## 📋 Requisitos Previos

| Herramienta | Versión Recomendada |
| :--- | :--- |
| **Node.js** | `>= 18.x` (LTS) |
| **npm** | `>= 9.x` |
| **Docker Engine** | `>= 20.10+` |
| **Docker Compose** | `>= 2.0+` |
| **PostgreSQL** | `15` o `16` (incluido en Docker Compose) |

**Puertos utilizados:** `3000` (Frontend), `4000` (Backend), `5432` (PostgreSQL).

---

## 💡 Características Principales

* 📈 **Resumen Ejecutivo de KPIs:**
  * **GMV (Gross Merchandise Value):** Suma bruta de precios de productos vendidos.
  * **Revenue (Paid):** Ingresos reales recaudados a través de pagos aprobados.
  * **Orders:** Conteo de órdenes únicas procesadas.
  * **AOV (Average Order Value):** Ticket promedio por orden.
  * **Items per Order:** Ratio de ítems comprados por orden.
  * **Cancellation Rate:** Tasa porcentual de órdenes canceladas.
  * **On-Time Delivery Rate:** Porcentaje de entregas realizadas dentro o antes de la fecha estimada.
  * **Shipping (Flete):** Costo acumulado de envíos.
* 🔍 **Filtros Globales Multidimensionales:**
  * Rango de fechas dinámico con validación de límites.
  * Selector por **Estado del Cliente** (27 estados de Brasil).
  * Combobox con búsqueda predictiva y scroll continuo para **73 Categorías de Producto**.
  * Filtro por **Estado del Pedido** (`delivered`, `shipped`, `canceled`, etc.).
* 🏆 **Rankings Top N Dinámicos:**
  * Tabla interactiva de los productos más vendidos con alternancia en tiempo real por **GMV** o por **Revenue**.
* 📊 **Tendencia Temporal con Zero-Filling:**
  * Gráficos interactivos de ingresos y volumen de pedidos con granularidad por **Día** o por **Semana**, garantizando continuidad de fechas con series temporales (`generate_series`).

---

## ⚙️ Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 14 + React 18                    │
│                 (App Router, TypeScript, UI)                │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                  Express.js + TypeScript                    │
│                 (Arquitectura Hexagonal)                    │
│  [Adapters / HTTP] ──► [Use Cases] ──► [Domain Contracts]   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM + SQL Nativo
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL 16 Engine                     │
│    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│    │  raw schema  │──►│ clean schema │──►│ gold schema  │   │
│    │  (Ingestión) │   │ (Limpieza)   │   │(Star Schema) │   │
│    └──────────────┘   └──────────────┘   └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

| Capa | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | Next.js 14, React 18, Recharts, CSS Modules | Interfaz moderna, gráficos responsivos, combobox accesible. |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM | API REST, validación estricta de DTOs, casos de uso desacoplados. |
| **Data Engine** | PostgreSQL 16 | Almacenamiento analítico en arquitectura medallón. |
| **DevOps** | Docker Compose, Dockerfiles Multi-stage | Orquestación reproducible de 3 servicios con healthchecks y volúmenes persistentes. |
| **Testing** | Vitest, Supertest | Pruebas unitarias de casos de uso y pruebas de integración de endpoints REST. |

---

## 🏛️ Arquitectura de Software (Hexagonal / Ports & Adapters)

El backend está estructurado para desacoplar completamente la lógica de negocio del framework web y del motor de base de datos:

```
backend/src/
├── domain/                  # Entidades, Value Objects y Contratos (Ports)
│   └── analytics.ts         # AnalyticsRepository (Port) y tipos de dominio
├── application/             # Casos de Uso (Application Layer)
│   ├── getKpis.ts           # Orquestación de cálculo de KPIs
│   ├── getRevenueTrend.ts   # Orquestación de serie temporal
│   └── getTopProducts.ts    # Orquestación de ranking de productos
├── adapters/                # Adaptadores Primarios (Entrada)
│   └── http/                # Express Controllers, Routes, DTOs y validación
└── infrastructure/          # Adaptadores Secundarios (Salida / Persistencia)
    ├── database/            # Implementación con Prisma (PrismaAnalyticsRepository)
    └── etl/                 # Pipeline de extracción, transformación y carga (runEtl.ts)
```

**Ventajas clave:**
* **Testabilidad:** Los casos de uso se prueban unitariamente utilizando *Mocks* sin requerir una conexión activa a la base de datos.
* **Mantenibilidad:** Cambiar la base de datos o el ORM solo requiere implementar una nueva clase que cumpla la interfaz `AnalyticsRepository`.

---

## 🗄️ Modelo de Datos (Medallion & Star Schema)

El pipeline de datos organiza la información en 3 esquemas secuenciales:

1. **`raw` (Ingestión cruda):** Refleja fielmente los archivos CSV originales descargados desde el repositorio de Olist con tipado base.
2. **`clean` (Capa conformada):** Normalización, limpieza de texto, deduplicación y casteo de tipos de datos.
3. **`gold` (Esquema Estrella Analítico):** Optimizado para consultas OLAP de alta velocidad.

### Esquema Estrella (`gold`)

* **Grano de la tabla de hechos:** **1 fila por ítem de orden** (`order_id + order_item_id`).

```
                    ┌─────────────────────────┐
                    │      gold.dim_date      │
                    │─────────────────────────│
                    │ date_key (PK)           │
                    │ full_date               │
                    │ year, quarter, month... │
                    └────────────┬────────────┘
                                 │
                                 │ 1:N
┌───────────────────────┐        │        ┌────────────────────────┐
│   gold.dim_customer   │        │        │    gold.dim_product    │
│───────────────────────│        │        │────────────────────────│
│ customer_key (PK)     │──┐     │     ┌──│ product_key (PK)       │
│ customer_id           │  │     │     │  │ product_id             │
│ state, city           │  │ 1:N │ 1:N │  │ category               │
└───────────────────────┘  │     │     │  └────────────────────────┘
                           │     │     │
                        ┌──▼─────▼─────▼───────────────┐
                        │       gold.fact_sales        │
                        │──────────────────────────────│
                        │ order_id, order_item_id (PK) │
                        │ date_key (FK)                │
                        │ customer_key (FK)            │
                        │ product_key (FK)             │
                        │ order_key (FK)               │
                        │ item_price                   │
                        │ freight_value                │
                        │ payment_value_allocated      │
                        │ is_delivered, is_canceled    │
                        │ is_on_time                   │
                        └──────────────▲───────────────┘
                                       │ 1:N
                        ┌──────────────┴───────────────┐
                        │       gold.dim_order         │
                        │──────────────────────────────│
                        │ order_key (PK)               │
                        │ order_id                     │
                        │ status                       │
                        │ order_purchase_timestamp     │
                        │ delivered_customer_date      │
                        │ estimated_delivery_date      │
                        └──────────────────────────────┘
```

### Regla de Asignación Exacta de Revenue (`payment_value_allocated`)
En el dataset de Olist, el pago se registra a nivel de orden, pero la tabla de hechos vive a nivel de ítem. Para evitar discrepancias de redondeo y garantizar que la suma de ítems sea exactamente igual al total pagado:

$$\text{Ítems } 1 \dots (n-1): \text{ROUND}\left(\frac{\text{Pago Total}}{n}, 2\right)$$

$$\text{Último Ítem } n: \text{Pago Total} - \sum_{i=1}^{n-1} \text{Pago Asignado}_i$$

---

## 🔌 API REST Endpoints

### 1. `GET /health`
* **Descripción:** Endpoint de verificación de estado y disponibilidad.
* **Respuesta:**
  ```json
  {
    "status": "ok"
  }
  ```

---

### 2. `GET /kpis`
* **Descripción:** Retorna el resumen consolidado de KPIs analíticos en el rango especificado.
* **Parámetros Query:**
  * `from` *(requerido, YYYY-MM-DD)*: Fecha inicial.
  * `to` *(requerido, YYYY-MM-DD)*: Fecha final.
  * `customer_state` *(opcional)*: Filtro por sigla de estado brasileño (ej. `SP`, `RJ`).
  * `product_category_name` *(opcional)*: Filtro por categoría (ej. `health_beauty`).
  * `order_status` *(opcional)*: Filtro por estado del pedido (ej. `delivered`).
* **Ejemplo de Respuesta:**
  ```json
  {
    "gmv": 1584320.50,
    "shipping": 182300.00,
    "revenuePaid": 1698760.20,
    "orders": 14230,
    "aov": 119.38,
    "itemsPerOrder": 1.16,
    "cancellationRate": 0.012,
    "onTimeDeliveryRate": 0.915
  }
  ```

---

### 3. `GET /trend/revenue`
* **Descripción:** Serie temporal de ingresos y volumen de pedidos.
* **Parámetros Query:** `from`, `to`, `grain` (`day` o `week`), y filtros opcionales.
* **Ejemplo de Respuesta:**
  ```json
  [
    {
      "period": "2017-01-01",
      "revenuePaid": 1250.40,
      "orders": 11
    },
    {
      "period": "2017-01-02",
      "revenuePaid": 3410.80,
      "orders": 28
    }
  ]
  ```

---

### 4. `GET /products/top`
* **Descripción:** Ranking de los productos más vendidos.
* **Parámetros Query:** `from`, `to`, `metric` (`gmv` o `revenue`), `limit` *(default: 10)*.
* **Ejemplo de Respuesta:**
  ```json
  [
    {
      "productId": "aca2eb7d00ea1a7b8ebd4e68314663af",
      "category": "furniture_decor",
      "gmv": 64320.00,
      "revenuePaid": 69450.10,
      "orders": 482
    }
  ]
  ```

---

## 🧪 Pruebas Automatizadas y Calidad de Código

El proyecto cuenta con suites de pruebas unitarias y de integración:

```bash
# Ejecutar pruebas unitarias (Vitest)
npm test --workspace=@ecommerce-sales/backend

# Ejecutar pruebas de integración de API con Supertest
npm run test:integration --workspace=@ecommerce-sales/backend

# Validación estática de código (ESLint)
npm run lint

# Formateo de código (Prettier)
npm run format
```

---

## 🛠️ Ejecución en Desarrollo Local (Sin Docker)

Si prefieres ejecutar los servicios directamente en tu entorno local:

```bash
# 1. Instalar dependencias del monorepo
npm install

# 2. Generar cliente de Prisma
npm run prisma:generate --workspace=@ecommerce-sales/backend

# 3. Configurar tu base de datos PostgreSQL local en .env y ejecutar el ETL
npm run etl:run --workspace=@ecommerce-sales/backend

# 4. Iniciar Backend (Puerto 4000)
npm run dev --workspace=@ecommerce-sales/backend

# 5. Iniciar Frontend (Puerto 3000)
npm run dev --workspace=@ecommerce-sales/frontend
```

---

## 📁 Estructura del Repositorio

```
ecommerce-sales-dashboard/
├── backend/
│   ├── src/
│   │   ├── adapters/http/        # Controladores, rutas y middlewares de Express
│   │   ├── application/          # Casos de uso de negocio (Use Cases)
│   │   ├── domain/               # Entidades, value objects e interfaces (Ports)
│   │   ├── infrastructure/       # Prisma Client, migraciones SQL nativas y ETL
│   │   └── index.ts              # Punto de entrada del servidor
│   ├── tests/
│   │   ├── unit/                 # Tests unitarios de casos de uso
│   │   └── integration/          # Tests de integración HTTP del API
│   ├── prisma/
│   │   └── schema.prisma         # Definición del modelo analítico (gold)
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                  # App Router de Next.js 14 y estilos globales
│   │   ├── components/           # Dashboard, Combobox, Charts y Componentes UI
│   │   ├── hooks/                # Custom hooks (useDashboardData)
│   │   ├── services/             # Cliente HTTP API
│   │   └── types/                # Definiciones de tipos TypeScript
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml            # Orquestación de servicios: db, backend, frontend
├── .env.example                  # Plantilla de variables de entorno documentadas
└── README.md
```

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](file:///c:/Users/Usuario/OneDrive%20-%20utmachala.edu.ec/Personal/Proyectos/Pruebas%20T%C3%A9cnicas/ecommerce-sales-dashboard/LICENSE) para más información.
