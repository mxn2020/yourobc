// convex/schema/system/user_settings/user_model_preferences/user_model_preferences.ts
// Table definitions for user_model_preferences module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '../../../base';
import { userModelPreferencesValidators } from './validators';

export const userModelPreferencesTable = defineTable({
  // Required: Main display field
  displayName: v.string(), // e.g., "Model Preferences for [User Name]"

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User identification (kept for backward compatibility)
  userId: v.id('userProfiles'),

  // Default model selections
  defaultLanguageModel: v.optional(v.string()),
  defaultEmbeddingModel: v.optional(v.string()),
  defaultImageModel: v.optional(v.string()),
  defaultMultimodalModel: v.optional(v.string()),

  // User favorites and filters
  favoriteModels: v.array(v.string()),
  hiddenProviders: v.array(v.string()),

  // View preferences
  preferredView: userModelPreferencesValidators.preferredView,
  sortPreference: userModelPreferencesValidators.sortPreference,

  // Testing defaults
  testingDefaults: v.optional(userModelPreferencesValidators.testingDefaults),

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
  .index('by_preferred_view', ['preferredView'])
  .index('by_created_at', ['createdAt']);
