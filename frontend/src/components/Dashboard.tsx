'use client';

import { useMemo, useState } from 'react';
import { Combobox, type ComboboxOption } from '@/components/Combobox';
import { RevenueTrendChart } from '@/components/RevenueTrendChart';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { AnalyticsFilters } from '@/types/analytics';

type DashboardTab = 'overview' | 'rankings';

const brazilStates = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

const productCategories = [
  'agro_industry_and_commerce',
  'air_conditioning',
  'art',
  'arts_and_craftmanship',
  'audio',
  'auto',
  'baby',
  'bed_bath_table',
  'books_general_interest',
  'books_imported',
  'books_technical',
  'cds_dvds_musicals',
  'christmas_supplies',
  'cine_photo',
  'computers',
  'computers_accessories',
  'consoles_games',
  'construction_tools_construction',
  'construction_tools_lights',
  'construction_tools_safety',
  'cool_stuff',
  'costruction_tools_garden',
  'costruction_tools_tools',
  'diapers_and_hygiene',
  'drinks',
  'dvds_blu_ray',
  'electronics',
  'fashion_bags_accessories',
  'fashion_childrens_clothes',
  'fashion_male_clothing',
  'fashion_shoes',
  'fashion_sport',
  'fashion_underwear_beach',
  'fashio_female_clothing',
  'fixed_telephony',
  'flowers',
  'food',
  'food_drink',
  'furniture_bedroom',
  'furniture_decor',
  'furniture_living_room',
  'furniture_mattress_and_upholstery',
  'garden_tools',
  'health_beauty',
  'home_appliances',
  'home_appliances_2',
  'home_comfort_2',
  'home_confort',
  'home_construction',
  'housewares',
  'industry_commerce_and_business',
  'kitchen_dining_laundry_garden_furniture',
  'la_cuisine',
  'luggage_accessories',
  'market_place',
  'music',
  'musical_instruments',
  'office_furniture',
  'party_supplies',
  'perfumery',
  'pet_shop',
  'security_and_services',
  'signaling_and_security',
  'small_appliances',
  'small_appliances_home_oven_and_coffee',
  'sports_leisure',
  'stationery',
  'tablets_printing_image',
  'telephony',
  'toys',
  'watches_gifts',
];

const stateOptions: ComboboxOption[] = brazilStates.map((state) => ({ value: state }));
const categoryOptions: ComboboxOption[] = productCategories.map((category) => ({
  value: category,
  label: category.replaceAll('_', ' '),
}));

const defaultFilters: AnalyticsFilters = {
  from: '2017-01-01',
  to: '2018-12-31',
  customer_state: 'SP',
};

const kpiCards = [
  { key: 'gmv', icon: 'R$', title: 'GMV', format: formatCurrency },
  { key: 'revenuePaid', icon: '$', title: 'Ingresos pagados', format: formatCurrency },
  { key: 'orders', icon: '#', title: 'Pedidos', format: formatNumber },
  { key: 'aov', icon: 'AOV', title: 'Ticket promedio', format: formatCurrency },
  { key: 'itemsPerOrder', icon: 'x1', title: 'Items por pedido', format: formatNumber },
  { key: 'cancellationRate', icon: '%', title: 'Tasa de cancelacion', format: formatPercent },
  { key: 'onTimeDeliveryRate', icon: 'OK', title: 'Entrega a tiempo', format: formatPercent },
  { key: 'shipping', icon: 'ENV', title: 'Envio', format: formatCurrency },
] as const;

export function Dashboard() {
  const [filters, setFilters] = useState(defaultFilters);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [rankingMetric, setRankingMetric] = useState<'gmv' | 'revenue'>('gmv');
  const stableFilters = useMemo(() => filters, [filters]);
  const { kpis, trend, topProducts, isLoading, error } = useDashboardData(
    stableFilters,
    rankingMetric,
  );
  const rankingLabel = rankingMetric === 'gmv' ? 'GMV' : 'Revenue';

  return (
    <main className="dashboard-page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel de Ventas</p>
          <h1>E-commerce Dashboard</h1>
          <p className="topbar-subtitle">Analitica comercial del dataset Olist</p>
        </div>
        <span className="date-badge">{formatDateRange(filters.from, filters.to)}</span>
      </header>

      <section className="filters-card" aria-label="Filtros del dashboard">
        <div className="filters-heading">
          <div>
            <h2>Filtrar por fechas y dimensiones</h2>
            <p>Los filtros se aplican al resumen, tendencia y rankings.</p>
          </div>
          {isLoading ? <span className="loading-pill">Actualizando...</span> : null}
        </div>

        <div className="filters-grid">
          <label className="filter-field">
            <span className="filter-label">Fecha desde</span>
            <span className="date-input-shell">
              <span aria-hidden="true">Cal</span>
              <input
                type="date"
                value={filters.from}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, from: event.target.value }))
                }
              />
            </span>
          </label>

          <label className="filter-field">
            <span className="filter-label">Fecha hasta</span>
            <span className="date-input-shell">
              <span aria-hidden="true">Cal</span>
              <input
                type="date"
                value={filters.to}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, to: event.target.value }))
                }
              />
            </span>
          </label>

          <Combobox
            label="Estado del cliente"
            value={filters.customer_state}
            options={stateOptions}
            placeholder="Buscar estado"
            onChange={(value) =>
              setFilters((current) => ({ ...current, customer_state: value || undefined }))
            }
          />

          <Combobox
            label="Categoria"
            value={filters.product_category_name}
            options={categoryOptions}
            placeholder="Buscar categoria"
            onChange={(value) =>
              setFilters((current) => ({
                ...current,
                product_category_name: value || undefined,
              }))
            }
          />

          <label className="filter-field">
            <span className="filter-label">Estado del pedido</span>
            <select
              className="select-control"
              value={filters.order_status ?? ''}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  order_status: event.target.value || undefined,
                }))
              }
            >
              <option value="">Todos</option>
              <option value="delivered">Entregado</option>
              <option value="shipped">Enviado</option>
              <option value="canceled">Cancelado</option>
              <option value="processing">En proceso</option>
              <option value="invoiced">Facturado</option>
              <option value="approved">Aprobado</option>
              <option value="created">Creado</option>
              <option value="unavailable">No disponible</option>
            </select>
          </label>
        </div>
      </section>

      <nav className="tabs" aria-label="Vistas del dashboard">
        <button
          type="button"
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Resumen Ejecutivo
        </button>
        <button
          type="button"
          className={activeTab === 'rankings' ? 'active' : ''}
          onClick={() => setActiveTab('rankings')}
        >
          Rankings
        </button>
      </nav>

      {error ? (
        <div className="alert" role="alert">
          <strong>No se pudieron cargar los datos.</strong>
          <span>{error}</span>
        </div>
      ) : null}

      {activeTab === 'overview' ? (
        <section className="view-panel" aria-label="Resumen Ejecutivo">
          {isLoading && !kpis ? (
            <OverviewSkeleton />
          ) : (
            <>
              <div className="kpi-grid" aria-label="Indicadores clave">
                {kpiCards.map((card) => (
                  <article className="kpi-card" key={card.key}>
                    <span className="kpi-icon">{card.icon}</span>
                    <div>
                      <p>{card.title}</p>
                      <strong>{card.format(kpis?.[card.key] ?? 0)}</strong>
                    </div>
                  </article>
                ))}
              </div>

              <section className="chart-card">
                <div className="section-title">
                  <div>
                    <p className="eyebrow">Tendencia</p>
                    <h2>Tendencia de Ingresos y Pedidos</h2>
                  </div>
                  <span className="metric-badge">Ingresos + pedidos</span>
                </div>
                {trend.length > 0 ? (
                  <RevenueTrendChart data={trend} />
                ) : (
                  <p className="empty-state">
                    No hay datos de tendencia para los filtros actuales.
                  </p>
                )}
              </section>
            </>
          )}
        </section>
      ) : (
        <section className="view-panel" aria-label="Rankings">
          <div className="section-title">
            <div>
              <p className="eyebrow">Rankings</p>
              <h2>Productos Mas Vendidos</h2>
            </div>
            <div className="ranking-toggle" aria-label="Metrica del ranking">
              <button
                type="button"
                className={rankingMetric === 'gmv' ? 'active' : ''}
                onClick={() => setRankingMetric('gmv')}
              >
                Por GMV
              </button>
              <button
                type="button"
                className={rankingMetric === 'revenue' ? 'active' : ''}
                onClick={() => setRankingMetric('revenue')}
              >
                Por Revenue
              </button>
            </div>
          </div>

          <section className="table-card">
            <div className="table-toolbar">
              <span>Top productos</span>
              <strong>{rankingLabel}</strong>
            </div>
            {isLoading && topProducts.length === 0 ? (
              <TableSkeleton />
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Categoria</th>
                      <th>{rankingLabel}</th>
                      <th>Pedidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.productId}>
                        <td>
                          <span className="product-code">{product.productId.slice(0, 10)}</span>
                        </td>
                        <td>{product.category ?? 'sin categoria'}</td>
                        <td>
                          <span className="metric-value">
                            {formatCurrency(
                              rankingMetric === 'gmv' ? product.gmv : product.revenuePaid,
                            )}
                          </span>
                        </td>
                        <td>{formatNumber(product.orders)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="kpi-grid">
        {Array.from({ length: 8 }).map((_, index) => (
          <div className="skeleton-card" key={index}>
            <span />
            <strong />
          </div>
        ))}
      </div>
      <div className="skeleton-chart" />
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="table-skeleton">
      {Array.from({ length: 7 }).map((_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function formatCurrency(value = 0): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value = 0): string {
  return new Intl.NumberFormat('es-EC', { maximumFractionDigits: 2 }).format(value);
}

function formatPercent(value = 0): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(value);
}

function formatDateRange(from: string, to: string): string {
  const formatter = new Intl.DateTimeFormat('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(new Date(`${from}T00:00:00`))} - ${formatter.format(
    new Date(`${to}T00:00:00`),
  )}`;
}
