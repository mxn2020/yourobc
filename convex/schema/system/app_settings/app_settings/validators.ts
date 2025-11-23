// convex/schema/system/app_settings/app_settings/validators.ts
// Grouped validators for appSettings module (schema implementation template)

import { v } from 'convex/values';
import { categoryTypes } from '@/schema/base';

// =============================================================================
// Primitive Validators
// =============================================================================

export const appSettingsValidators = {
  // Identification & organization
  key: v.string(),
  category: categoryTypes.settingCategory,

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
