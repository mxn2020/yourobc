// src/features/boilerplate/analytics/hooks/useMetrics.ts

import { useQuery } from "convex/react";
import { api } from '@/convex/_generated/api'
import { GetMetricParams, MetricData, DateRangePreset } from "../types";
import { getDateRangeFromPreset } from "../utils/date-utils";
import { useMemo } from "react";

/**
 * Hook to fetch metric data
 */
export function useMetric(params: GetMetricParams) {
  const data = useQuery(api.lib.boilerplate.analytics.queries.getMetric, {
    metricType: params.metricType,
    period: params.period,
    startDate: params.startDate,
    endDate: params.endDate,
    dimension: params.dimension,
  });

  return useMemo(
    () => ({
      data: data || [],
      isLoading: data === undefined,
    }),
    [data]
  );
}

/**
 * Hook to fetch multiple metrics at once
 */
export function useMetrics(metricTypes: string[], params: Omit<GetMetricParams, "metricType">) {
  // Fetch each metric
  const results = metricTypes.map((metricType) =>
    useQuery(api.lib.boilerplate.analytics.queries.getMetric, {
      metricType,
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
      dimension: params.dimension,
    })
  );

  return useMemo(() => {
    const isLoading = results.some((r) => r === undefined);
    const metricsData: Record<string, MetricData[]> = {};

    metricTypes.forEach((metricType, index) => {
      metricsData[metricType] = results[index] || [];
    });

    return {
      data: metricsData,
      isLoading,
    };
  }, [results, metricTypes]);
}

/**
 * Hook to fetch metric with date range preset
 */
export function useMetricWithPreset(
  metricType: string,
  period: GetMetricParams["period"],
  preset: DateRangePreset,
  dimension?: string
) {
  const dateRange = useMemo(() => getDateRangeFromPreset(preset), [preset]);

  return useMetric({
    metricType,
    period,
    startDate: dateRange.start,
    endDate: dateRange.end,
    dimension,
  });
}

/**
 * Hook to fetch a single metric value (latest)
 */
export function useMetricValue(
  metricType: string,
  period: GetMetricParams["period"],
  preset: DateRangePreset = "last_30_days"
) {
  const { data, isLoading } = useMetricWithPreset(metricType, period, preset);

  const value = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Get the most recent metric
    const sorted = [...data].sort((a, b) => b.periodStart - a.periodStart);
    return sorted[0];
  }, [data]);

  return {
    value,
    isLoading,
  };
}

/**
 * Hook to calculate trend (percentage change)
 */
export function useMetricTrend(
  metricType: string,
  period: GetMetricParams["period"],
  preset: DateRangePreset = "last_30_days"
) {
  const { data, isLoading } = useMetricWithPreset(metricType, period, preset);

  const trend = useMemo(() => {
    if (!data || data.length < 2) return null;

    // Sort by period start
    const sorted = [...data].sort((a, b) => a.periodStart - b.periodStart);

    // Calculate change between first and last period
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    const change = last.count - first.count;
    const percentChange = first.count === 0 ? 0 : (change / first.count) * 100;

    return {
      change,
      percentChange,
      direction: change > 0 ? ("up" as const) : change < 0 ? ("down" as const) : ("flat" as const),
      firstValue: first.count,
      lastValue: last.count,
    };
  }, [data]);

  return {
    trend,
    isLoading,
  };
}

/**
 * Hook to fetch analytics summary
 */
export function useAnalyticsSummary(preset: DateRangePreset = "last_30_days") {
  const data = useQuery(
    api.lib.boilerplate.analytics.queries.getAnalyticsSummary,
    { period: preset }
  );

  return useMemo(
    () => ({
      data: data || null,
      isLoading: data === undefined,
    }),
    [data]
  );
}

/**
 * Hook to fetch page views
 */
export function usePageViews(
  startDate: number,
  endDate: number,
  pagePath?: string,
  limit?: number
) {
  const data = useQuery(api.lib.boilerplate.analytics.queries.getPageViews, {
    startDate,
    endDate,
    pagePath,
    limit,
  });

  return useMemo(
    () => ({
      data: data || [],
      isLoading: data === undefined,
    }),
    [data]
  );
}

/**
 * Hook to fetch active sessions (real-time)
 */
export function useActiveSessions() {
  const data = useQuery(api.lib.boilerplate.analytics.queries.getActiveSessions);

  return useMemo(
    () => ({
      count: data || 0,
      isLoading: data === undefined,
    }),
    [data]
  );
}

/**
 * Hook to fetch unique users
 */
export function useUniqueUsers(startDate: number, endDate: number) {
  const data = useQuery(api.lib.boilerplate.analytics.queries.getUniqueUsers, {
    startDate,
    endDate,
  });

  return useMemo(
    () => ({
      count: data || 0,
      isLoading: data === undefined,
    }),
    [data]
  );
}
