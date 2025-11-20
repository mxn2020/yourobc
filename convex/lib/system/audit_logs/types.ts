// convex/lib/system/audit_logs/types.ts
// convex/auditLogs/types.ts

import type { Doc, Id } from '@/generated/dataModel';
import { EntityType } from '../../../types';

export type AuditLog = Doc<'auditLogs'>;
export type AuditLogId = Id<'auditLogs'>;

export interface CreateAuditLogData {
  userId?: Id<'userProfiles'>;
  userName?: string;
  action: string;
  entityType: EntityType;
  entityId?: string;
  entityTitle?: string;
  description: string;
  metadata?: {
    source?: string;
    operation?: string;
    oldValues?: any;
    newValues?: any;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any;
  };
}

export interface AuditLogFilters {
  userId?: Id<'userProfiles'>;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: number;
  dateTo?: number;
}

export interface AuditLogListOptions {
  limit?: number;
  offset?: number;
  filters?: AuditLogFilters;
  sortOrder?: 'asc' | 'desc';
}

