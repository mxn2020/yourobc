/**
 * User Model Preferences Schema
 *
 * Database schemas for user AI model preferences and defaults
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { auditFields, softDeleteFields } from "../../../base";
import { userModelPreferencesValidators } from './validators';

/**
 * User model preferences table
 * Stores user-specific AI model preferences and defaults
 */
export const userModelPreferencesTable = defineTable({
  // Public ID for shareable references
  publicId: v.string(),

  // User identification (userId serves as ownerId)
  userId: v.id('userProfiles'),

  // Main display field - user identifier
  displayName: v.string(), // e.g., "Model Preferences for [User Name]"

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

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index("by_public_id", ["publicId"])
  .index("by_display_name", ["displayName"])
  .index("by_deleted_at", ["deletedAt"])

  // Module-specific indexes
  .index('by_user_id', ['userId'])
  .index('by_preferred_view', ['preferredView'])
  .index('by_created_at', ['createdAt']);

/**
 * Export the table schema
 */
export const userModelPreferencesSchemas = {
  userModelPreferencesTable,
};
