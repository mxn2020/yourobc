// convex/schema/boilerplate/system/appThemeSettings/appThemeSettings.ts
// Table definitions for appThemeSettings module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appThemeSettingsValidators } from './validators';

export const appThemeSettingsTable = defineTable({
  // Setting identification
  key: appThemeSettingsValidators.key,
  value: appThemeSettingsValidators.value,

  // Organization
  category: appThemeSettingsValidators.category,
  description: appThemeSettingsValidators.description,

  // Standard metadata and audit fields
  metadata: appThemeSettingsValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key', ['key'])
  .index('by_category', ['category'])
  .index('by_created_at', ['createdAt']);
