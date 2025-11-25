// convex/schema/system/app_theme_settings/app_theme_settings/app_theme_settings.ts
// Table definitions for app_theme_settings module

import { v } from 'convex/values';
import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appThemeSettingsFields } from './validators';

export const appThemeSettingsTable = defineTable({
  // Required display field for GUIDE compliance
  name: v.string(),

  // Required core fields
  publicId: v.string(),
  // Exemption: system-level theme settings are not user-owned
  ownerId: v.optional(v.id('userProfiles')),

  // Setting identification
  key: v.string(),
  value: appThemeSettingsFields.themeValue,

  // Organization
  category: v.string(),
  description: v.optional(v.string()),

  // Editability flag
  isEditable: v.boolean(),

  // Additional metadata for UI/source tracking
  metadata: v.optional(appThemeSettingsFields.metadata),

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
  .index('by_created_at', ['createdAt'])
  .index('by_updated_at', ['updatedAt']);
