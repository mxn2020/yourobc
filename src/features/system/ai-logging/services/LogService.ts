// src/features/ai-logging/services/LogService.ts

import { useQuery, useMutation } from '@tanstack/react-query';
import { convexQuery, useConvexMutation } from '@convex-dev/react-query';
import { api } from '@/convex/_generated/api';
import type { AIUsageLog, AIUsageFilter, LogQueryResult } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { Id } from "@/convex/_generated/dataModel";

export class LogService {
  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  static getAILogsQueryOptions(filters: {
    search?: string;
    modelId?: string;
    provider?: string;
    requestType?: string;
    success?: boolean;
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    return convexQuery(api.lib.system.ai_logs.queries.getAILogs, filters);
  }

  static getAILogQueryOptions(logId: Id<'aiLogs'>) {
    return convexQuery(api.lib.system.ai_logs.queries.getAILog, { logId });
  }

  static getAILogByPublicIdQueryOptions(publicId: string) {
    return convexQuery(api.lib.system.ai_logs.queries.getAILogByPublicId, { publicId });
  }

  static getAILogsStatsQueryOptions(filters: {
    startDate?: number;
    endDate?: number;
  } = {}) {
    return convexQuery(api.lib.system.ai_logs.queries.getAILogStats, filters);
  }

  // ==========================================
  // QUERY HOOKS
  // ==========================================

  static useAILogs(filters: {
    search?: string;
    modelId?: string;
    provider?: string;
    requestType?: string;
    success?: boolean;
    startDate?: number;
    endDate?: number;
    limit?: number;
    offset?: number;
  } = {}) {
    return useQuery({
      ...LogService.getAILogsQueryOptions(filters),
      staleTime: 30000, // 30 seconds
    });
  }

  static useAILog(logId?: Id<'aiLogs'>) {
    return useQuery({
      ...LogService.getAILogQueryOptions(logId!),
      staleTime: 60000, // 1 minute
      enabled: !!logId,
    });
  }

  static useAILogByPublicId(publicId?: string) {
    return useQuery({
      ...LogService.getAILogByPublicIdQueryOptions(publicId!),
      staleTime: 60000, // 1 minute
      enabled: !!publicId,
    });
  }

  static useAILogsStats(filters: {
    startDate?: number;
    endDate?: number;
  } = {}) {
    return useQuery({
      ...LogService.getAILogsStatsQueryOptions(filters),
      staleTime: 60000, // 1 minute
    });
  }

  // ==========================================
  // LEGACY REST API METHODS (Keep for backward compatibility)
  // ==========================================

  static async getLogs(filters: AIUsageFilter = {}): Promise<LogQueryResult> {
    const params = new URLSearchParams();
    
    if (filters.search) params.set('search', filters.search);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.modelId?.length) params.set('modelId', filters.modelId.join(','));
    if (filters.provider?.length) params.set('provider', filters.provider.join(','));
    if (filters.requestType?.length) params.set('requestType', filters.requestType.join(','));
    if (filters.success !== undefined) params.set('success', filters.success.toString());
    if (filters.finishReason?.length) params.set('finishReason', filters.finishReason.join(','));
    if (filters.hasToolCalls !== undefined) params.set('hasToolCalls', filters.hasToolCalls.toString());
    if (filters.hasFiles !== undefined) params.set('hasFiles', filters.hasFiles.toString());
    
    if (filters.dateRange) {
      params.set('startDate', filters.dateRange.start.getTime().toString());
      params.set('endDate', filters.dateRange.end.getTime().toString());
    }
    
    if (filters.costRange) {
      if (filters.costRange.min !== undefined) params.set('costMin', filters.costRange.min.toString());
      if (filters.costRange.max !== undefined) params.set('costMax', filters.costRange.max.toString());
    }
    
    if (filters.latencyRange) {
      if (filters.latencyRange.min !== undefined) params.set('latencyMin', filters.latencyRange.min.toString());
      if (filters.latencyRange.max !== undefined) params.set('latencyMax', filters.latencyRange.max.toString());
    }
    
    if (filters.tokenRange) {
      if (filters.tokenRange.min !== undefined) params.set('tokenMin', filters.tokenRange.min.toString());
      if (filters.tokenRange.max !== undefined) params.set('tokenMax', filters.tokenRange.max.toString());
    }
    
    if (filters.sort) {
      params.set('sortField', filters.sort.field);
      params.set('sortDirection', filters.sort.direction);
    }
    
    if (filters.limit) params.set('limit', filters.limit.toString());
    if (filters.offset) params.set('offset', filters.offset.toString());

    const response = await fetch(`/api/ai/logs?${params}`);
    const data: GatewayResponse<LogQueryResult> = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  static async getLog(logId: string): Promise<AIUsageLog> {
    const response = await fetch(`/api/ai/logs/${encodeURIComponent(logId)}`);
    const data: GatewayResponse<AIUsageLog> = await response.json();
    
    if (!data.success) throw new Error(data.error);
    return data.data;
  }

  static async deleteLog(logId: string): Promise<void> {
    const response = await fetch(`/api/ai/logs/${encodeURIComponent(logId)}`, {
      method: 'DELETE'
    });

    const data: GatewayResponse<void> = await response.json();
    if (!data.success) throw new Error(data.error);
  }

  static async exportLogs(options: { filters: AIUsageFilter; format: 'csv' | 'json' }): Promise<string> {
    const response = await fetch('/api/ai/logs/export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    // Check if the response is a file download
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('text/csv') || contentType?.includes('application/json')) {
      return await response.text();
    }

    // Otherwise, it's a JSON error response
    const data: GatewayResponse<{ csv: string }> = await response.json();
    if (!data.success) throw new Error(data.error);
    return data.data.csv;
  }
}