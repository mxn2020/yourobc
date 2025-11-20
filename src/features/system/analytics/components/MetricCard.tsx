// src/features/system/analytics/components/MetricCard.tsx

import { useMetricValue, useMetricTrend } from "../hooks/useMetrics";
import { MetricPeriod, DateRangePreset } from "../types";

interface MetricCardProps {
  metricType: string;
  label: string;
  period?: MetricPeriod;
  preset?: DateRangePreset;
  showTrend?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

/**
 * MetricCard Component
 * Displays a metric value with optional trend indicator
 */
export function MetricCard({
  metricType,
  label,
  period = "day",
  preset = "last_30_days",
  showTrend = true,
  formatValue = (value) => value.toLocaleString(),
  className = "",
}: MetricCardProps) {
  const { value, isLoading } = useMetricValue(metricType, period, preset);
  const { trend } = useMetricTrend(metricType, period, preset);

  if (isLoading) {
    return (
      <div className={`metric-card loading ${className}`}>
        <div className="metric-label">{label}</div>
        <div className="metric-value">Loading...</div>
      </div>
    );
  }

  const metricValue = value?.count || value?.sum || value?.average || 0;

  return (
    <div className={`metric-card ${className}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{formatValue(metricValue)}</div>

      {showTrend && trend && (
        <div className={`metric-trend ${trend.direction}`}>
          {trend.direction === "up" && "↑"}
          {trend.direction === "down" && "↓"}
          {trend.direction === "flat" && "→"}
          <span className="metric-trend-value">
            {Math.abs(trend.percentChange).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
