// convex/schema/system/user_profiles/user_profiles/user_profiles.ts
// Table definitions for user profiles module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { userProfilesFields, userProfilesValidators } from './validators';

export const userProfilesTable = defineTable({
  // Exemption: ownerId not used because the profile itself is the user record
  displayName: v.string(),
  publicId: v.string(),

  authUserId: v.string(),
  email: v.string(),
  name: v.optional(v.string()),
  avatar: v.optional(v.string()),
  bio: v.optional(v.string()),

  role: userProfilesValidators.role,
  permissions: v.array(v.string()),

  banned: v.boolean(),
  banReason: v.optional(v.string()),
  banExpires: v.optional(v.number()),
  authCreatedAt: v.optional(v.number()),
  authUpdatedAt: v.optional(v.number()),

  stats: userProfilesFields.stats,
  badges: v.array(v.string()),

  lastActiveAt: v.number(),
  lastLoginAt: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),

  isActive: v.boolean(),
  isEmailVerified: v.boolean(),
  isProfileComplete: v.boolean(),

  extendedMetadata: v.optional(userProfilesFields.extendedMetadata),

  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_displayName', ['displayName'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_auth_user_id', ['authUserId'])
  .index('by_email', ['email'])
  .index('by_role', ['role'])
  .index('by_is_active', ['isActive'])
  .index('by_last_active_at', ['lastActiveAt'])
  .index('by_created_at', ['createdAt']);
