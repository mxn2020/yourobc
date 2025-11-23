// convex/schema/system/app_settings/app_settings/appSettings.ts
// Table definitions for appSettings module (template-compliant)

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appSettingsFields, appSettingsValidators } from './validators';

export const appSettingsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.optional(v.id('userProfiles')),

  // Setting identification
  key: appSettingsValidators.key,
  category: appSettingsValidators.category,

  // Setting value & typing
  value: appSettingsFields.settingValue,
  valueType: appSettingsValidators.valueType,

  // Descriptive context
  description: v.optional(v.string()),

  // Access control
  isPublic: appSettingsValidators.isPublic,

  // Metadata
  metadata: v.optional(appSettingsFields.metadata),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key', ['key'])
  .index('by_category', ['category'])
  .index('by_value_type', ['valueType'])
  .index('by_public', ['isPublic'])
  .index('by_created_at', ['createdAt']);
