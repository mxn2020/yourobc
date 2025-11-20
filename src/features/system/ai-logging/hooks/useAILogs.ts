// src/features/ai-logging/hooks/useAILogs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { LogService } from '../services/LogService';
import type { AIUsageFilter, AIUsageLog } from '@/features/boilerplate/ai-core/types';
import { Id } from "@/convex/_generated/dataModel";

const LOGS_QUERY_KEY = ['ai-logs'] as const;

export function useAILogs(filters: AIUsageFilter = {}) {
  return useQuery({
    queryKey: [...LOGS_QUERY_KEY, 'list', filters],
    queryFn: () => LogService.getLogs(filters),
    staleTime: 30000,
    gcTime: 300000
  });
}

export function useAILog(logId: string) {
  return useQuery({
    queryKey: [...LOGS_QUERY_KEY, 'detail', logId],
    queryFn: () => LogService.getLog(logId),
    enabled: Boolean(logId),
    staleTime: 300000,
    gcTime: 600000
  });
}

export function useDeleteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ logId }: { logId: string }) =>
      LogService.deleteLog(logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
    }
  });
}

export function useExportLogs() {
  return useMutation({
    mutationFn: LogService.exportLogs
  });
}

export function useRefreshLogs() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: LOGS_QUERY_KEY });
  }, [queryClient]);
}