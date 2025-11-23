// convex/schema/system/appConfigs/validators.ts
// Grouped validators for appConfigs module

import { v } from 'convex/values';

/**
 * Type union for configuration values - prevents v.any()
 */
const configValue = v.union(
  v.string(),
  v.number(),
  v.boolean(),
  v.null(),
  v.array(v.union(v.string(), v.number(), v.boolean())),
  v.object({})
);

/**
 * Validators for appConfigs module
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
  // Shared config value type for all config value storage
  configValue,

  // Validation and constraints
  validationRules: v.object({
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    pattern: v.optional(v.string()),
    allowedValues: v.optional(v.array(configValue)),
    required: v.optional(v.boolean()),
    customValidation: v.optional(v.string()),
  }),

  // Change history entry with typed value
  changeHistoryEntry: v.object({
    value: configValue,
    changedBy: v.id('userProfiles'),
    changedAt: v.number(),
    reason: v.optional(v.string()),
  }),

  // Configuration metadata
  configMetadata: v.object({
    source: v.optional(v.string()),
    operation: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),
} as const;
