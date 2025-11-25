// convex/schema/system/app_configs/app_configs/app_configs.ts
// Table definitions for app_configs module

import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appConfigsValidators, appConfigsFields } from './validators';

/**
 * App Configurations Table
 *
 * Stores runtime-editable feature configurations that admins can modify.
 * This complements environment variables with database-stored settings.
 *
 * Configuration Hierarchy:
 * 1. Environment variables (.env) - Base configuration, deployment-specific
 * 2. Code defaults (config/*.ts) - Feature defaults and validation rules
 * 3. Database configs (appConfigs) - Runtime overrides, admin-editable
 *
 * Use Cases:
 * - Enable/disable features without redeployment
 * - Adjust limits and quotas in production
 * - Configure integrations through UI
 * - A/B test feature toggles
 * - Tenant-specific overrides (multi-tenant apps)
 */
export const appConfigsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields for GUIDE compliance
  publicId: v.string(),

  // Configuration identification
  feature: v.string(),
  featureKey: v.string(),
  key: v.string(),
  value: appConfigsFields.configValue,

  // Value type and validation
  valueType: appConfigsValidators.valueType,

  // Configuration metadata
  category: v.optional(v.string()),
  section: v.optional(v.string()),
  description: v.optional(v.string()),

  // Access control
  scope: appConfigsValidators.scope,
  tenantId: v.optional(v.string()),

  // Validation and constraints
  validationRules: v.optional(appConfigsFields.validationRules),

  // Default and override tracking
  defaultValue: appConfigsFields.configValue,
  isOverridden: v.boolean(),
  overrideSource: v.optional(appConfigsValidators.overrideSource),

  // UI presentation
  displayOrder: v.optional(v.number()),
  isVisible: v.boolean(),
  isEditable: v.boolean(),
  requiresRestart: v.optional(v.boolean()),

  // Change tracking
  changeHistory: v.optional(v.array(appConfigsFields.changeHistoryEntry)),

  // Metadata
  metadata: v.optional(appConfigsFields.configMetadata),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_feature', ['feature'])
  .index('by_feature_key', ['feature', 'featureKey', 'key'])
  // Note: category is optional, can't index it
  .index('by_scope', ['scope'])
  // Note: tenantId is optional, can't index it
  .index('by_visible', ['isVisible'])
  .index('by_editable', ['isEditable'])
  .index('by_created_at', ['createdAt']);
