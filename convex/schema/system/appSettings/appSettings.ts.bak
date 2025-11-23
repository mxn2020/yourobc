// convex/schema/system/system/appSettings/appSettings.ts
// Table definitions for appSettings module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appSettingsValidators } from './validators';

export const appSettingsTable = defineTable({
  // Setting identification
  key: appSettingsValidators.key,
  value: appSettingsValidators.value,

  // Organization
  category: appSettingsValidators.category,
  description: appSettingsValidators.description,

  // Access control
  isPublic: appSettingsValidators.isPublic,

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key', ['key'])
  .index('by_category', ['category'])
  .index('by_public', ['isPublic'])
  .index('by_created_at', ['createdAt']);
