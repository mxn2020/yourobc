// src/queries.ts

import { useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/generated/api';
import type { SearchFilters, AuditLogFilters } from './types'
import { Id } from '@/convex/_generated/dataModel'

// Audit Log Queries (User-scoped)
export const auditLogQueries = {
  list: (filters?: Partial<AuditLogFilters> & { limit?: number; offset?: number }) =>
    convexQuery(api.lib.system.core.audit_logs.queries.getAuditLogs, {
      options: {
        limit: filters?.limit,
        offset: filters?.offset,
        filters: {
          search: filters?.query,
          userId: filters?.userId ?? undefined,
          action: filters?.action?.[0],
          entityType: filters?.entityType?.[0],
          dateFrom: filters?.dateRange?.start,
          dateTo: filters?.dateRange?.end,
        },
      },
    }),
  stats: (timeWindow?: 'day' | 'week' | 'month' | 'all') =>
    convexQuery(api.lib.system.core.audit_logs.queries.getMyAuditLogStats, {
      timeWindow,
    }),
}

// Admin Audit Log Queries (Admin-only)
export const adminAuditLogQueries = {
  list: (filters?: Partial<AuditLogFilters> & { limit?: number; offset?: number }) =>
    convexQuery(api.lib.system.core.audit_logs.admin_queries.adminGetAuditLogs, {
      options: {
        limit: filters?.limit,
        offset: filters?.offset,
        filters: {
          search: filters?.query,
          userId: filters?.userId ?? undefined,
          action: filters?.action?.[0],
          entityType: filters?.entityType?.[0],
          dateFrom: filters?.dateRange?.start,
          dateTo: filters?.dateRange?.end,
        },
      },
    }),
  stats: (timeWindow?: 'day' | 'week' | 'month' | 'all') =>
    convexQuery(api.lib.system.core.audit_logs.admin_queries.adminGetAuditLogStats, {
      timeWindow,
    }),
}

