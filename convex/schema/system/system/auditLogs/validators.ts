// convex/schema/system/system/auditLogs/validators.ts
// Grouped validators for auditLogs module

import { v } from 'convex/values';

export const auditLogsValidators = {
  // User who performed the action
  userId: v.optional(v.id('userProfiles')),
  userName: v.string(),

  // Action performed
  action: v.string(),

  // Entity being audited
  entityType: v.string(),
  entityId: v.string(),

  // Entity title (snapshot at time of action)
  entityTitle: v.optional(v.string()),

  // Action description
  description: v.optional(v.string()),

  // Standard metadata
  metadata: v.optional(v.union(
    v.object({
      source: v.optional(v.string()),
      operation: v.optional(v.string()),
      oldValues: v.optional(v.record(v.string(), v.any())),
      newValues: v.optional(v.record(v.string(), v.any())),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }),
    v.record(v.string(), v.any())
  )),
} as const;
