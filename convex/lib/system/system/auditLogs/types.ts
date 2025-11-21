// convex/lib/system/system/auditLogs/types.ts
// TypeScript type definitions for auditLogs module

import type { Doc, Id } from '@/generated/dataModel';

export type AuditLog = Doc<'auditLogs'>;
export type AuditLogId = Id<'auditLogs'>;

export interface AuditLogListResponse {
  items: AuditLog[];
  total: number;
  hasMore: boolean;
}

export interface AuditLogFilters {
  userId?: Id<'userProfiles'>;
  action?: string;
  entityType?: string;
  entityId?: string;
  startDate?: number;
  endDate?: number;
  search?: string;
}
