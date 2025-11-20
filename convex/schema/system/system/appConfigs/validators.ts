// convex/schema/boilerplate/system/appConfigs/validators.ts
// Grouped validators for appConfigs module

import { v } from 'convex/values';
import { metadataSchema } from '../../../base';

export const appConfigsValidators = {
  // Configuration identification
  feature: v.string(),
  key: v.string(),
  value: v.any(),

  // Value type for validation and UI rendering
  valueType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('object'),
    v.literal('array')
  ),

  // Configuration metadata
  category: v.string(),
  section: v.optional(v.string()),
  description: v.optional(v.string()),

  // Access control
  scope: v.union(
    v.literal('global'),
    v.literal('tenant'),
    v.literal('user')
  ),
  tenantId: v.optional(v.string()),
  userId: v.optional(v.id('userProfiles')),

  // Validation and constraints
  validationRules: v.optional(
    v.object({
      min: v.optional(v.number()),
      max: v.optional(v.number()),
      pattern: v.optional(v.string()),
      enum: v.optional(v.array(v.any())),
      required: v.optional(v.boolean()),
    })
  ),

  // Default and override tracking
  defaultValue: v.any(),
  isOverridden: v.boolean(),
  overrideSource: v.optional(
    v.union(
      v.literal('admin'),
      v.literal('api'),
      v.literal('migration'),
      v.literal('system')
    )
  ),

  // UI presentation
  displayOrder: v.optional(v.number()),
  isVisible: v.boolean(),
  isEditable: v.boolean(),
  requiresRestart: v.boolean(),

  // Change tracking
  changeHistory: v.optional(
    v.array(
      v.object({
        value: v.any(),
        changedBy: v.id('userProfiles'),
        changedAt: v.number(),
        reason: v.optional(v.string()),
      })
    )
  ),

  // Standard metadata
  metadata: metadataSchema,
} as const;
