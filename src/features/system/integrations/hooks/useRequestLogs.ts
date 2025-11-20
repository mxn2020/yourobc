// src/features/boilerplate/integrations/hooks/useRequestLogs.ts

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMemo } from "react";
import { GetRequestLogsParams, ApiRequestLog, UsageStats } from "../types";

/**
 * Hook to get API request logs
 *
 * @example
 * ```tsx
 * function RequestLogsPage() {
 *   const { logs, isLoading } = useRequestLogs({
 *     apiKeyId: selectedApiKeyId,
 *     startDate: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
 *     endDate: Date.now(),
 *     limit: 100,
 *   });
 *
 *   return (
 *     <div>
 *       {logs.map(log => (
 *         <div key={log._id}>
 *           {log.method} {log.path} - {log.statusCode}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRequestLogs(params: GetRequestLogsParams) {
  const logs = useQuery(
    api.lib.boilerplate.integrations.queries.getApiRequestLogs,
    params.apiKeyId || params.startDate || params.endDate
      ? {
          apiKeyId: params.apiKeyId,
          startDate: params.startDate,
          endDate: params.endDate,
          statusCode: params.statusCode,
          limit: params.limit,
        }
      : "skip"
  );

  return useMemo(
    () => ({
      logs: logs || [],
      isLoading: logs === undefined,
    }),
    [logs]
  );
}

/**
 * Hook to get recent request logs (last 24 hours)
 */
export function useRecentRequestLogs(limit: number = 100) {
  const endDate = Date.now();
  const startDate = endDate - 24 * 60 * 60 * 1000; // Last 24 hours

  return useRequestLogs({
    startDate,
    endDate,
    limit,
  });
}

/**
 * Hook to get failed request logs
 */
export function useFailedRequests(limit: number = 100) {
  const endDate = Date.now();
  const startDate = endDate - 24 * 60 * 60 * 1000; // Last 24 hours

  const { logs, isLoading } = useRequestLogs({
    startDate,
    endDate,
    limit: limit * 2, // Get more to filter
  });

  const failedLogs = useMemo(() => {
    return logs.filter((log) => log.statusCode >= 400).slice(0, limit);
  }, [logs, limit]);

  return {
    logs: failedLogs,
    isLoading,
  };
}

/**
 * Hook to get request logs for a specific API key
 */
export function useApiKeyRequestLogs(
  apiKeyId: Id<"apiKeys"> | undefined,
  limit: number = 100
) {
  const endDate = Date.now();
  const startDate = endDate - 7 * 24 * 60 * 60 * 1000; // Last 7 days

  return useRequestLogs({
    apiKeyId,
    startDate,
    endDate,
    limit,
  });
}

/**
 * Hook to get usage statistics
 *
 * @example
 * ```tsx
 * function UsageStatsCard() {
 *   const { stats, isLoading } = useUsageStats(
 *     userId,
 *     Date.now() - 30 * 24 * 60 * 60 * 1000, // Last 30 days
 *     Date.now()
 *   );
 *
 *   if (isLoading) return <div>Loading...</div>;
 *
 *   return (
 *     <div>
 *       <p>Total Requests: {stats.totalRequests}</p>
 *       <p>Success Rate: {(stats.successfulRequests / stats.totalRequests * 100).toFixed(2)}%</p>
 *       <p>Avg Response Time: {stats.averageResponseTime}ms</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUsageStats(
  startDate: number,
  endDate: number
) {
  const stats = useQuery(
    api.lib.boilerplate.integrations.queries.getApiUsageStats,
    startDate && endDate ? { startDate, endDate } : "skip"
  );

  return useMemo(
    () => ({
      stats: stats || null,
      isLoading: stats === undefined,
    }),
    [stats]
  );
}

/**
 * Hook to get usage statistics for the last 30 days
 */
export function useRecentUsageStats() {
  const endDate = Date.now();
  const startDate = endDate - 30 * 24 * 60 * 60 * 1000; // Last 30 days

  return useUsageStats(startDate, endDate);
}

/**
 * Hook to get integration events
 */
export function useIntegrationEvents(params: {
  integrationId: Id<"externalIntegrations">;
  eventType?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
}) {
  const events = useQuery(
    api.lib.boilerplate.integrations.queries.getIntegrationEvents,
    params.integrationId
      ? {
          integrationId: params.integrationId,
          eventType: params.eventType,
          startDate: params.startDate,
          endDate: params.endDate,
          limit: params.limit,
        }
      : "skip"
  );

  return useMemo(
    () => ({
      events: events || [],
      isLoading: events === undefined,
    }),
    [events]
  );
}

/**
 * Hook to get recent integration events
 */
export function useRecentIntegrationEvents(
  integrationId: Id<"externalIntegrations"> | undefined,
  limit: number = 50
) {
  const endDate = Date.now();
  const startDate = endDate - 7 * 24 * 60 * 60 * 1000; // Last 7 days

  if (!integrationId) {
    return { events: [], isLoading: false };
  }

  return useIntegrationEvents({
    integrationId,
    startDate,
    endDate,
    limit,
  });
}
