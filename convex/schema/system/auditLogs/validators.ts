// convex/schema/system/auditLogs/validators.ts
// Grouped validators for auditLogs module

import { v } from 'convex/values';

// Metadata value type - supports common JSON-serializable types
// Better than `any` - provides type safety while remaining flexible
const metadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({}) // For nested objects
);

export const auditLogsValidators = {
  // No simple validators needed yet
} as const;

export const auditLogsFields = {
  // Audit logs metadata (for tracking audit operation details)
  auditMetadata: v.object({
    operation: v.optional(v.string()),

    // Change tracking - what was modified
    oldValues: v.optional(v.record(v.string(), metadataValue)),
    newValues: v.optional(v.record(v.string(), metadataValue)),

    // Request context
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    source: v.optional(v.union(
      v.literal('web'),
      v.literal('api'),
      v.literal('system'),
      v.literal('webhook')
    )),

    // Admin actions
    impersonatedBy: v.optional(v.string()), // If admin acting as user

    // Bulk operations
    batchId: v.optional(v.string()), // For bulk operations
    affectedCount: v.optional(v.number()), // How many items affected

    // Error tracking
    errorDetails: v.optional(v.object({
      code: v.optional(v.string()),
      message: v.optional(v.string()),
      stack: v.optional(v.string()),
    })),
  }),
} as const;
