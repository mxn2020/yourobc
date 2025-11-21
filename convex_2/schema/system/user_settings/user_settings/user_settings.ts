/**
 * User Settings Schema
 *
 * Database schemas for user-specific application settings and preferences
 */

import { defineTable } from "convex/server";
import { v } from "convex/values";
import { auditFields, softDeleteFields } from "../../../base";
import { userSettingsValidators } from './validators';

/**
 * User settings table
 * Stores user-specific application settings and preferences
 */
export const userSettingsTable = defineTable({
  // Public ID for shareable references
  publicId: v.string(),

  // User identification (userId serves as ownerId)
  userId: v.id('userProfiles'),

  // Main display field - user identifier
  displayName: v.string(), // e.g., "Settings for [User Name]"

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

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index("by_public_id", ["publicId"])
  .index("by_display_name", ["displayName"])
  .index("by_owner", ["userId"]) // userId serves as ownerId
  .index("by_deleted_at", ["deletedAt"])

  // Module-specific indexes
  .index('by_user_id', ['userId'])
  .index('by_theme', ['theme'])
  .index('by_language', ['language'])
  .index('by_created_at', ['createdAt']);

/**
 * Export the table schema
 */
export const userSettingsSchemas = {
  userSettingsTable,
};
