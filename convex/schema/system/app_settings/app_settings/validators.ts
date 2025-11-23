// convex/schema/system/app_settings/app_settings/validators.ts
// Grouped validators and complex fields for app_settings module

import { v } from 'convex/values';

// Inline category enum to avoid schema import cycles
const settingCategory = v.union(
  v.literal('ai'),
  v.literal('general'),
  v.literal('security'),
  v.literal('notifications'),
  v.literal('billing'),
  v.literal('integrations')
);

export const appSettingsValidators = {
  // Identification & organization
  key: v.string(),
  category: settingCategory,

  // Value typing and access control
  valueType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('object'),
    v.literal('array'),
    v.literal('null')
  ),
  isPublic: v.boolean(),
} as const;

// =============================================================================
// Complex Field Schemas
// =============================================================================

const settingValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({})
);

export const appSettingsFields = {
  settingValue,
  metadata: v.object({
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    lastUpdatedBy: v.optional(v.id('userProfiles')),
    lastUpdatedAt: v.optional(v.number()),
  }),
} as const;
