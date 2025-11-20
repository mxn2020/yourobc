// src/features/ai-logging/utils/log-filters.ts
import type { AIUsageFilter, AIUsageLog } from '@/features/boilerplate/ai-core/types';
import type { LogDateRange } from '../types/log.types';
import { getDateRangeForPreset } from '@/utils/common/date-utils';

export function createEmptyLogFilter(): AIUsageFilter {
  return {
    limit: 50,
    offset: 0
  };
}

export function getDateRangeFilter(range: LogDateRange): AIUsageFilter['dateRange'] | undefined {
  if (range === 'custom') return undefined;
  
  const { start, end } = getDateRangeForPreset(range);
  return { start, end };
}

export function isLogFilterActive(filter: AIUsageFilter): boolean {
  const activeFields = [
    filter.search,
    filter.userId,
    filter.modelId?.length,
    filter.provider?.length,
    filter.requestType?.length,
    filter.success !== undefined,
    filter.finishReason?.length,
    filter.hasToolCalls !== undefined,
    filter.hasFiles !== undefined,
    filter.dateRange,
    filter.costRange,
    filter.latencyRange,
    filter.tokenRange
  ];
  
  return activeFields.some(field => Boolean(field));
}

export function getActiveFilterCount(filter: AIUsageFilter): number {
  let count = 0;
  
  if (filter.search) count++;
  if (filter.userId) count++;
  if (filter.modelId?.length) count++;
  if (filter.provider?.length) count++;
  if (filter.requestType?.length) count++;
  if (filter.success !== undefined) count++;
  if (filter.finishReason?.length) count++;
  if (filter.hasToolCalls !== undefined) count++;
  if (filter.hasFiles !== undefined) count++;
  if (filter.dateRange) count++;
  if (filter.costRange) count++;
  if (filter.latencyRange) count++;
  if (filter.tokenRange) count++;
  
  return count;
}

export function getFilterSummary(filter: AIUsageFilter): string[] {
  const summary: string[] = [];
  
  if (filter.search) summary.push(`Search: "${filter.search}"`);
  if (filter.modelId?.length) summary.push(`Models: ${filter.modelId.length}`);
  if (filter.provider?.length) summary.push(`Providers: ${filter.provider.join(', ')}`);
  if (filter.requestType?.length) summary.push(`Types: ${filter.requestType.join(', ')}`);
  if (filter.success !== undefined) summary.push(`Status: ${filter.success ? 'Success' : 'Failed'}`);
  if (filter.dateRange) summary.push('Date range');
  if (filter.costRange) summary.push('Cost range');
  if (filter.latencyRange) summary.push('Latency range');
  
  return summary;
}

export function filterLogsClientSide(logs: AIUsageLog[], filter: AIUsageFilter): AIUsageLog[] {
  if (!isLogFilterActive(filter)) return logs;
  
  return logs.filter(log => {
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      const searchableText = [
        log.prompt,
        log.response || '',
        log.modelId,
        log.provider,
        log.errorMessage || ''
      ].join(' ').toLowerCase();
      
      if (!searchableText.includes(searchTerm)) return false;
    }
    
    if (filter.userId && log.userId !== filter.userId) return false;
    if (filter.modelId?.length && !filter.modelId.includes(log.modelId)) return false;
    if (filter.provider?.length && !filter.provider.includes(log.provider)) return false;
    if (filter.requestType?.length && !filter.requestType.includes(log.requestType)) return false;
    if (filter.success !== undefined && log.success !== filter.success) return false;
    if (filter.finishReason?.length && log.finishReason && !filter.finishReason.includes(log.finishReason)) return false;
    if (filter.hasToolCalls !== undefined && Boolean(log.toolCalls?.length) !== filter.hasToolCalls) return false;
    if (filter.hasFiles !== undefined && Boolean(log.files?.length) !== filter.hasFiles) return false;
    
    if (filter.dateRange) {
      const logDate = log.createdAt;
      if (logDate < filter.dateRange.start || logDate > filter.dateRange.end) return false;
    }
    
    if (filter.costRange) {
      if (log.cost < (filter.costRange.min || 0) || log.cost > (filter.costRange.max || Infinity)) return false;
    }
    
    if (filter.latencyRange) {
      if (log.latencyMs < (filter.latencyRange.min || 0) || log.latencyMs > (filter.latencyRange.max || Infinity)) return false;
    }
    
    if (filter.tokenRange) {
      const totalTokens = log.usage.totalTokens || 0;
      if (totalTokens < (filter.tokenRange.min || 0) || totalTokens > (filter.tokenRange.max || Infinity)) return false;
    }
    
    return true;
  });
}