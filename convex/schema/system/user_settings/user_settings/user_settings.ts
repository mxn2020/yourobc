// convex/schema/system/user_settings/user_settings/user_settings.ts
// Table definitions for user_settings module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '../../../base';
import { userSettingsValidators } from './validators';

export const userSettingsTable = defineTable({
  // Required: Main display field
  displayName: v.string(), // e.g., "Settings for [User Name]"

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User identification (kept for backward compatibility)
  userId: v.id('userProfiles'),

  // Theme preferences
  theme: userSettingsValidators.theme,

  // Localization settings
  language: v.string(),
  timezone: v.string(),
  dateFormat: v.string(),

  // Layout preferences
  layoutPreferences: userSettingsValidators.layoutPreferences,

  // Notification preferences
  notificationPreferences: userSettingsValidators.notificationPreferences,

  // Dashboard preferences
  dashboardPreferences: userSettingsValidators.dashboardPreferences,

  // Version for optimistic concurrency control
  version: v.number(),

  // Standard metadata
  metadata: metadataSchema,

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_display_name', ['displayName'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_user_id', ['userId'])
  .index('by_theme', ['theme'])
  .index('by_language', ['language'])
  .index('by_created_at', ['createdAt']);
