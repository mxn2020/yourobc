// convex/schema/system/system/appSettings/appSettings.ts
// Table definitions for appSettings module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { appSettingsValidators } from './validators';

export const appSettingsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Setting identification
  key: appSettingsValidators.key,
  value: appSettingsValidators.value,

  // Organization
  category: appSettingsValidators.category,
  description: appSettingsValidators.description,

  // Access control
  isPublic: appSettingsValidators.isPublic,

  // Standard metadata and audit fields
  metadata: appSettingsValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_key', ['key'])
  .index('by_category', ['category'])
  .index('by_public', ['isPublic'])
  .index('by_owner_and_category', ['ownerId', 'category'])
  .index('by_created_at', ['createdAt']);
