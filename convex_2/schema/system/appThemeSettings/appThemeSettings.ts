// convex/schema/system/system/appThemeSettings/appThemeSettings.ts
// Table definitions for appThemeSettings module

import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appThemeSettingsFields } from './validators';

export const appThemeSettingsTable = defineTable({
  // Public ID for external references
  publicId: v.optional(v.string()),

  // Setting identification
  key: v.string(),
  value: v.any(),

  // Organization
  category: v.string(),
  description: v.optional(v.string()),

  // Editability flag
  isEditable: v.optional(v.boolean()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key', ['key'])
  .index('by_category', ['category'])
  .index('by_public_id', ['publicId'])
  .index('by_created_at', ['createdAt'])
  .index('by_updated_at', ['updatedAt']);
