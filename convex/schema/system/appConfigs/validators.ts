// convex/schema/system/system/appConfigs/validators.ts
// Grouped validators for appConfigs module

import { v } from 'convex/values';

/**
 * Simple validators for appConfigs module
 */
export const appConfigsValidators = {
  // Value type for validation and UI rendering
  valueType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('object'),
    v.literal('array')
  ),

  // Access control scope
  scope: v.union(v.literal('global'), v.literal('tenant'), v.literal('user')),

  // Override source
  overrideSource: v.union(
    v.literal('admin'),
    v.literal('api'),
    v.literal('migration'),
    v.literal('system')
  ),
} as const;

/**
 * Complex object schemas for appConfigs module
 */
export const appConfigsFields = {
  // Validation and constraints
  validationRules: v.object({
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    pattern: v.optional(v.string()),
    allowedValues: v.optional(v.array(v.any())),
    required: v.optional(v.boolean()),
    customValidation: v.optional(v.string()),
  }),

  // Change history entry
  changeHistoryEntry: v.object({
    value: v.any(),
    changedBy: v.id('userProfiles'),
    changedAt: v.number(),
    reason: v.optional(v.string()),
  }),

} as const;
