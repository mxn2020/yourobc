// convex/lib/boilerplate/autumn/autumn_usage_logs/types.ts
// TypeScript type definitions for autumn usage logs module

import type { Doc, Id } from '@/generated/dataModel';

// Entity types
export type AutumnUsageLog = Doc<'autumnUsageLogs'>;
export type AutumnUsageLogId = Id<'autumnUsageLogs'>;

// Data interfaces
export interface CreateAutumnUsageLogData {
  name: string;
  userId: Id<'userProfiles'>;
  authUserId: string;
  autumnCustomerId: string;
  featureId: string;
  value: number;
}

export interface UpdateAutumnUsageLogData {
  name?: string;
  value?: number;
  metadata?: any;
}

// Response types
export interface AutumnUsageLogListResponse {
  items: AutumnUsageLog[];
  total: number;
  hasMore: boolean;
}

// Filter types
export interface AutumnUsageLogFilters {
  syncedToAutumn?: boolean;
  featureId?: string;
  search?: string;
}
