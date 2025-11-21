// convex/schema/system/system/appSettings/validators.ts
// Grouped validators for appSettings module

import { v } from 'convex/values';

export const appSettingsValidators = {
  // Setting key
  key: v.string(),

  // Setting value (can be any type)
  value: v.any(),

  // Category for organization
  category: v.string(),

  // Optional description
  description: v.optional(v.string()),

  // Public accessibility flag
  isPublic: v.boolean(),

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
