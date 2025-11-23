// convex/schema/system/user_settings/user_settings/user_settings.ts
// Table definitions for user settings module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { userSettingsFields, userSettingsValidators } from './validators';

export const userSettingsTable = defineTable({
  displayName: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  theme: userSettingsValidators.theme,
  language: v.string(),
  timezone: v.string(),
  dateFormat: v.string(),

  layoutPreferences: userSettingsFields.layoutPreferences,
  notificationPreferences: userSettingsFields.notificationPreferences,
  dashboardPreferences: userSettingsFields.dashboardPreferences,

  version: v.number(),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_theme', ['theme'])
  .index('by_language', ['language'])
  .index('by_created_at', ['createdAt']);
