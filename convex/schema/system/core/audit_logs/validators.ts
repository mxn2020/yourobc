// convex/schema/system/core/audit_logs/validators.ts
// Grouped validators and complex fields for audit_logs module

import { v } from 'convex/values';

// Metadata value type - supports common JSON-serializable types without v.any
const metadataValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({}) // For nested objects
);

export const auditLogsValidators = {
  source: v.union(
    v.literal('web'),
    v.literal('api'),
    v.literal('system'),
    v.literal('webhook'),
    v.literal('project'),
  ),
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
    source: v.optional(auditLogsValidators.source),

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

    // Arbitrary extra fields:
    data: v.optional(v.record(v.string(), metadataValue)),
  }),
} as const;
