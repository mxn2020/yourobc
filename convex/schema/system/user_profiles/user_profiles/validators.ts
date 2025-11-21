// convex/schema/system/user_profiles/user_profiles/validators.ts
// Grouped validators for user_profiles module

import { v } from 'convex/values';

export const userProfilesValidators = {
  // User role validator
  role: v.union(
    v.literal('superadmin'),
    v.literal('admin'),
    v.literal('user'),
    v.literal('moderator'),
    v.literal('editor'),
    v.literal('analyst'),
    v.literal('guest')
  ),

  // User stats schema
  userStats: v.object({
    karmaLevel: v.number(),
    tasksCompleted: v.number(),
    tasksAssigned: v.number(),
    projectsCreated: v.number(),
    loginCount: v.number(),
    totalAIRequests: v.number(),
    totalAICost: v.number(),
  }),

  // Extended metadata structure
  extendedMetadata: v.optional(v.object({
    recoveredAt: v.optional(v.number()),
    recoveredFrom: v.optional(v.string()),
    syncSource: v.optional(v.string()),
    migrationVersion: v.optional(v.string()),
    customFields: v.optional(v.record(v.string(), v.any())),
    tags: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  })),

  // Metadata value schema (for flexible metadata)
  metadataValue: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.null(),
    v.array(v.union(v.string(), v.number(), v.boolean())),
    v.object({})
  ),

  // Standard metadata
  metadata: v.optional(v.union(
    v.object({
      source: v.optional(v.string()),
      operation: v.optional(v.string()),
      oldValues: v.optional(v.record(v.string(), v.any())),
      newValues: v.optional(v.record(v.string(), v.any())),
      ipAddress: v.optional(v.string()),
      userAgent: v.optional(v.string()),
    }),
    v.record(v.string(), v.any())
  )),
} as const;
