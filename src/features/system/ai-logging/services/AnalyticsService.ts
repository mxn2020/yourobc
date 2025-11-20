// src/features/ai-logging/services/AnalyticsService.ts
import type { AIUsageStats, AIUsageFilter } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import type { AnalyticsDashboardData } from '../types/analytics.types';

export class AnalyticsService {
  static async getStats(filters: AIUsageFilter = {}): Promise<AIUsageStats> {
    const params = new URLSearchParams();
    
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.dateRange) {
      params.set('startDate', filters.dateRange.start.getTime().toString());
      params.set('endDate', filters.dateRange.end.getTime().toString());
    }
    if (filters.modelId?.length) params.set('modelId', filters.modelId.join(','));
    if (filters.provider?.length) params.set('provider', filters.provider.join(','));

    const response = await fetch(`/api/ai/logs/analytics?${params}`);
    const data: GatewayResponse<AIUsageStats> = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  static async getDashboardData(
    timeRange: { start: Date; end: Date },
    compareRange?: { start: Date; end: Date }
  ): Promise<AnalyticsDashboardData> {
    const params = new URLSearchParams();
    params.set('startDate', timeRange.start.getTime().toString());
    params.set('endDate', timeRange.end.getTime().toString());
    
    if (compareRange) {
      params.set('compareStartDate', compareRange.start.getTime().toString());
      params.set('compareEndDate', compareRange.end.getTime().toString());
    }

    const response = await fetch(`/api/ai/logs/dashboard?${params}`);
    const data: GatewayResponse<AnalyticsDashboardData> = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }
}