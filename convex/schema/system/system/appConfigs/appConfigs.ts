// convex/schema/system/system/appConfigs/appConfigs.ts
// Table definitions for appConfigs module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appConfigsValidators } from './validators';

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
  // Configuration identification
  feature: appConfigsValidators.feature,
  key: appConfigsValidators.key,
  value: appConfigsValidators.value,

  // Value type and validation
  valueType: appConfigsValidators.valueType,

  // Configuration metadata
  category: appConfigsValidators.category,
  section: appConfigsValidators.section,
  description: appConfigsValidators.description,

  // Access control
  scope: appConfigsValidators.scope,
  tenantId: appConfigsValidators.tenantId,
  userId: appConfigsValidators.userId,

  // Validation and constraints
  validationRules: appConfigsValidators.validationRules,

  // Default and override tracking
  defaultValue: appConfigsValidators.defaultValue,
  isOverridden: appConfigsValidators.isOverridden,
  overrideSource: appConfigsValidators.overrideSource,

  // UI presentation
  displayOrder: appConfigsValidators.displayOrder,
  isVisible: appConfigsValidators.isVisible,
  isEditable: appConfigsValidators.isEditable,
  requiresRestart: appConfigsValidators.requiresRestart,

  // Change tracking
  changeHistory: appConfigsValidators.changeHistory,

  // Standard metadata and audit fields
  metadata: appConfigsValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_feature', ['feature'])
  .index('by_feature_key', ['feature', 'key'])
  .index('by_category', ['category'])
  .index('by_scope', ['scope'])
  .index('by_tenant', ['tenantId'])
  .index('by_user', ['userId'])
  .index('by_visible', ['isVisible'])
  .index('by_editable', ['isEditable'])
  .index('by_created_at', ['createdAt'])
  .index('by_updated_at', ['updatedAt']);
