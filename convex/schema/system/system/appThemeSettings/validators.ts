// convex/schema/system/system/appThemeSettings/validators.ts
// Grouped validators for appThemeSettings module

import { v } from 'convex/values';

export const appThemeSettingsValidators = {
  // Setting key (e.g., 'primaryColor', 'logo', 'fontFamily', 'navigationItems')
  key: v.string(),

  // Setting value (can be any type)
  value: v.any(),

  // Category (e.g., 'theme', 'branding', 'navigation', 'layout')
  category: v.string(),

  // Optional description
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
