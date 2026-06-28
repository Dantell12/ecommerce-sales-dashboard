'use client';

import { useEffect, useState } from 'react';
import { fetchKpis, fetchRevenueTrend, fetchTopProducts } from '@/services/api';
import type {
  AnalyticsFilters,
  KpiSummary,
  RevenueTrendPoint,
  TopProduct,
} from '@/types/analytics';

interface DashboardData {
  kpis: KpiSummary | null;
  trend: RevenueTrendPoint[];
  topProducts: TopProduct[];
  isLoading: boolean;
  error: string | null;
}

export function useDashboardData(filters: AnalyticsFilters): DashboardData {
  const [data, setData] = useState<DashboardData>({
    kpis: null,
    trend: [],
    topProducts: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setData((current) => ({ ...current, isLoading: true, error: null }));

      try {
        const [kpis, trend, topProducts] = await Promise.all([
          fetchKpis(filters),
          fetchRevenueTrend(filters, 'day'),
          fetchTopProducts(filters, 'gmv', 10),
        ]);

        if (isMounted) {
          setData({ kpis, trend, topProducts, isLoading: false, error: null });
        }
      } catch (error) {
        if (isMounted) {
          setData({
            kpis: null,
            trend: [],
            topProducts: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unexpected error',
          });
        }
      }
    }

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [filters]);

  return data;
}
