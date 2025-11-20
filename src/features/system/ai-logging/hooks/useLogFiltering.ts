// src/features/ai-logging/hooks/useLogFiltering.ts
import { useMemo, useCallback } from 'react';
import type { AIUsageFilter, AIUsageLog } from '@/features/boilerplate/ai-core/types';
import { 
  isLogFilterActive, 
  getActiveFilterCount, 
  getFilterSummary, 
  filterLogsClientSide 
} from '../utils/log-filters';

export function useLogFiltering(logs: AIUsageLog[], filters: AIUsageFilter) {
  const filteredLogs = useMemo(() => {
    return filterLogsClientSide(logs, filters);
  }, [logs, filters]);

  const isActive = useMemo(() => isLogFilterActive(filters), [filters]);
  const activeCount = useMemo(() => getActiveFilterCount(filters), [filters]);
  const summary = useMemo(() => getFilterSummary(filters), [filters]);

  return {
    filteredLogs,
    isActive,
    activeCount,
    summary
  };
}

export function useLogSorting(logs: AIUsageLog[], sortConfig?: AIUsageFilter['sort']) {
  return useMemo(() => {
    if (!sortConfig || !logs.length) return logs;

    return [...logs].sort((a, b) => {
      let aValue: unknown;
      let bValue: unknown;

      switch (sortConfig.field) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'cost':
          aValue = a.cost;
          bValue = b.cost;
          break;
        case 'latencyMs':
          aValue = a.latencyMs;
          bValue = b.latencyMs;
          break;
        case 'usage.totalTokens':
          aValue = a.usage.totalTokens || 0;
          bValue = b.usage.totalTokens || 0;
          break;
        default:
          return 0;
      }

      const comparison = typeof aValue === 'number' && typeof bValue === 'number'
        ? aValue - bValue
        : 0;

      return sortConfig.direction === 'desc' ? -comparison : comparison;
    });
  }, [logs, sortConfig]);
}

export function useLogPagination(logs: AIUsageLog[], pageSize = 50) {
  const paginate = useCallback((currentPage: number) => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      items: logs.slice(startIndex, endIndex),
      totalItems: logs.length,
      totalPages: Math.ceil(logs.length / pageSize),
      hasNext: endIndex < logs.length,
      hasPrev: currentPage > 1
    };
  }, [logs, pageSize]);

  return { paginate };
}