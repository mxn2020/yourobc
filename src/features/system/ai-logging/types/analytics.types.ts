// src/features/ai-logging/types/analytics.types.ts
import type { AIUsageStats } from '@/features/system/ai-core/types';
import type { ModelProvider } from '@/features/system/ai-core/types';

export interface UsageChartData {
  date: string;
  requests: number;
  cost: number;
  tokens: number;
  avgLatency: number;
  successRate: number;
}

export interface CostBreakdownData {
  provider: ModelProvider;
  modelId: string;
  cost: number;
  requests: number;
  percentage: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  label: string;
}

export interface AnalyticsDashboardData {
  overview: {
    totalRequests: number;
    totalCost: number;
    avgLatency: number;
    successRate: number;
  };
  charts: {
    usage: UsageChartData[];
    costBreakdown: CostBreakdownData[];
    performance: PerformanceMetric[];
  };
  trends: {
    requestsTrend: number;
    costTrend: number;
    latencyTrend: number;
    errorTrend: number;
  };
}