// src/features/ai-logging/hooks/useLogAnalytics.ts
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { AnalyticsService } from '../services/AnalyticsService';
import type { AIUsageFilter } from '@/features/boilerplate/ai-core/types';
import type { AnalyticsTimeRange } from '../types/analytics.types';

const ANALYTICS_QUERY_KEY = ['ai-logs-analytics'] as const;

export function useLogAnalytics(filters: AIUsageFilter = {}) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'stats', filters],
    queryFn: () => AnalyticsService.getStats(filters),
    staleTime: 60000,
    gcTime: 300000
  });
}

export function useDashboardAnalytics(
  timeRange: AnalyticsTimeRange,
  compareRange?: AnalyticsTimeRange
) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, 'dashboard', timeRange, compareRange],
    queryFn: () => AnalyticsService.getDashboardData(timeRange, compareRange),
    staleTime: 60000,
    gcTime: 300000
  });
}

export function useAnalyticsTimeRanges() {
  return useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return {
      today: {
        start: today,
        end: now,
        label: 'Today'
      },
      yesterday: {
        start: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        end: new Date(today.getTime() - 1),
        label: 'Yesterday'
      },
      last7Days: {
        start: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 7 days'
      },
      last30Days: {
        start: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        end: now,
        label: 'Last 30 days'
      },
      thisMonth: {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: now,
        label: 'This month'
      },
      lastMonth: {
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59),
        label: 'Last month'
      }
    };
  }, []);
}