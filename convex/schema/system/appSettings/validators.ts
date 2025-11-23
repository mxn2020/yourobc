// convex/schema/system/appSettings/validators.ts
// Grouped validators for appSettings module

import { v } from 'convex/values';

const settingValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({})
);

export const appSettingsValidators = {
  valueType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('object'),
    v.literal('array')
  ),
  isPublic: v.boolean(),
} as const;

export const appSettingsFields = {
  settingValue,
  metadata: v.object({
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),
} as const;
