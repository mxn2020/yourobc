// convex/schema/system/core/audit_logs/validators.ts
// Grouped validators and complex fields for audit_logs module

import { v } from 'convex/values';

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
  // Allow flexible key/value pairs so feature modules can attach custom context
  auditMetadata: v.record(v.string(), v.any()),
} as const;
