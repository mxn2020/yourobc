// src/features/ai-logging/utils/analytics-helpers.ts
import type { AIUsageLog, ModelProvider } from '@/features/boilerplate/ai-core/types';
import type { UsageChartData, CostBreakdownData, PerformanceMetric, AnalyticsDashboardData } from '../types/analytics.types';
import { groupBy } from '@/utils/common/array-utils';
import { formatDate } from '@/features/boilerplate/ai-core/utils';

export function calculateUsageByDay(logs: AIUsageLog[], days = 30): UsageChartData[] {
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  
  const dateGroups = groupBy(logs, log => {
    const date = new Date(log.createdAt);
    return formatDate(date, { format: 'short' });
  });
  
  const chartData: UsageChartData[] = [];
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateKey = formatDate(date, { format: 'short' });
    const dayLogs = dateGroups[dateKey] || [];
    
    const successfulLogs = dayLogs.filter(log => log.success);
    const totalCost = dayLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = dayLogs.reduce((sum, log) => sum + (log.usage.totalTokens || 0), 0);
    const avgLatency = dayLogs.length > 0 
      ? dayLogs.reduce((sum, log) => sum + log.latencyMs, 0) / dayLogs.length 
      : 0;
    const successRate = dayLogs.length > 0 ? (successfulLogs.length / dayLogs.length) * 100 : 0;
    
    chartData.push({
      date: dateKey,
      requests: dayLogs.length,
      cost: totalCost,
      tokens: totalTokens,
      avgLatency: Math.round(avgLatency),
      successRate: Math.round(successRate * 100) / 100
    });
  }
  
  return chartData;
}

export function calculateCostBreakdown(logs: AIUsageLog[]): CostBreakdownData[] {
  const modelGroups = groupBy(logs, log => `${log.provider}/${log.modelId}`);
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  
  return Object.entries(modelGroups)
    .map(([key, groupLogs]) => {
      const [provider, modelId] = key.split('/');
      const cost = groupLogs.reduce((sum, log) => sum + log.cost, 0);

      return {
        provider: provider as ModelProvider,
        modelId: modelId || provider,
        cost,
        requests: groupLogs.length,
        percentage: totalCost > 0 ? (cost / totalCost) * 100 : 0
      };
    })
    .sort((a, b) => b.cost - a.cost);
}

export function calculatePerformanceMetrics(
  currentLogs: AIUsageLog[], 
  previousLogs: AIUsageLog[] = []
): PerformanceMetric[] {
  const currentAvgLatency = currentLogs.length > 0 
    ? currentLogs.reduce((sum, log) => sum + log.latencyMs, 0) / currentLogs.length 
    : 0;
  
  const previousAvgLatency = previousLogs.length > 0 
    ? previousLogs.reduce((sum, log) => sum + log.latencyMs, 0) / previousLogs.length 
    : currentAvgLatency;
  
  const currentSuccessRate = currentLogs.length > 0
    ? (currentLogs.filter(log => log.success).length / currentLogs.length) * 100
    : 0;
  
  const previousSuccessRate = previousLogs.length > 0
    ? (previousLogs.filter(log => log.success).length / previousLogs.length) * 100
    : currentSuccessRate;
  
  const currentAvgCost = currentLogs.length > 0
    ? currentLogs.reduce((sum, log) => sum + log.cost, 0) / currentLogs.length
    : 0;
  
  const previousAvgCost = previousLogs.length > 0
    ? previousLogs.reduce((sum, log) => sum + log.cost, 0) / previousLogs.length
    : currentAvgCost;
  
  const calculateTrend = (current: number, previous: number): { trend: 'up' | 'down' | 'stable', change: number } => {
    if (previous === 0) return { trend: 'stable', change: 0 };
    
    const change = ((current - previous) / previous) * 100;
    
    if (Math.abs(change) < 5) return { trend: 'stable', change };
    return { trend: change > 0 ? 'up' : 'down', change: Math.abs(change) };
  };
  
  const latencyTrend = calculateTrend(currentAvgLatency, previousAvgLatency);
  const successTrend = calculateTrend(currentSuccessRate, previousSuccessRate);
  const costTrend = calculateTrend(currentAvgCost, previousAvgCost);
  
  return [
    {
      name: 'Avg Latency',
      value: Math.round(currentAvgLatency),
      unit: 'ms',
      trend: latencyTrend.trend === 'up' ? 'down' : latencyTrend.trend === 'down' ? 'up' : 'stable', // Inverted for latency
      change: latencyTrend.change
    },
    {
      name: 'Success Rate',
      value: Math.round(currentSuccessRate * 100) / 100,
      unit: '%',
      trend: successTrend.trend,
      change: successTrend.change
    },
    {
      name: 'Avg Cost',
      value: currentAvgCost,
      unit: '$',
      trend: costTrend.trend === 'up' ? 'down' : costTrend.trend === 'down' ? 'up' : 'stable', // Inverted for cost
      change: costTrend.change
    }
  ];
}

export function calculateDashboardData(
  logs: AIUsageLog[],
  previousLogs: AIUsageLog[] = []
): AnalyticsDashboardData {
  const totalRequests = logs.length;
  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
  const successfulLogs = logs.filter(log => log.success);
  const avgLatency = logs.length > 0 
    ? logs.reduce((sum, log) => sum + log.latencyMs, 0) / logs.length 
    : 0;
  const successRate = logs.length > 0 ? (successfulLogs.length / logs.length) * 100 : 0;
  
  // Calculate trends
  const prevTotalRequests = previousLogs.length;
  const prevTotalCost = previousLogs.reduce((sum, log) => sum + log.cost, 0);
  const prevAvgLatency = previousLogs.length > 0 
    ? previousLogs.reduce((sum, log) => sum + log.latencyMs, 0) / previousLogs.length 
    : 0;
  const prevErrorRate = previousLogs.length > 0
    ? ((previousLogs.length - previousLogs.filter(log => log.success).length) / previousLogs.length) * 100
    : 0;
  const currentErrorRate = logs.length > 0
    ? ((logs.length - successfulLogs.length) / logs.length) * 100
    : 0;
  
  const calculateTrendChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  return {
    overview: {
      totalRequests,
      totalCost,
      avgLatency: Math.round(avgLatency),
      successRate: Math.round(successRate * 100) / 100
    },
    charts: {
      usage: calculateUsageByDay(logs),
      costBreakdown: calculateCostBreakdown(logs),
      performance: calculatePerformanceMetrics(logs, previousLogs)
    },
    trends: {
      requestsTrend: calculateTrendChange(totalRequests, prevTotalRequests),
      costTrend: calculateTrendChange(totalCost, prevTotalCost),
      latencyTrend: calculateTrendChange(avgLatency, prevAvgLatency),
      errorTrend: calculateTrendChange(currentErrorRate, prevErrorRate)
    }
  };
}