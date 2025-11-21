// convex/schema/system/user_profiles/user_profiles/user_profiles.ts
// User profiles table definition - manages system user profiles with Better Auth integration

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '../../../base';
import { userProfilesValidators } from './validators';

/**
 * User Profiles Table
 *
 * Stores user profile data synchronized from Better Auth with additional
 * application-specific fields for gamification, permissions, and activity tracking.
 *
 * Note: This table uses authUserId as the primary user identifier (from Better Auth),
 * but the _id field serves as ownerId for owned entities.
 */
export const userProfilesTable = defineTable({
  // Required fields per GUIDE pattern
  publicId: v.string(),
  name: v.optional(v.string()), // Optional as users may not have set a name yet
  // Note: authUserId serves as the primary identifier instead of a separate ownerId
  // The _id field acts as ownerId for entities owned by this user

  // Better Auth Integration
  authUserId: v.string(), // Links to Better Auth user.id (external ID stored as string)
  email: v.string(),
  avatar: v.optional(v.string()),
  bio: v.optional(v.string()),

  // Role-Based Access Control
  role: userProfilesValidators.role,
  permissions: v.array(v.string()),

  // Better Auth Sync Fields
  banned: v.boolean(),
  banReason: v.optional(v.string()),
  banExpires: v.optional(v.number()),
  authCreatedAt: v.optional(v.number()),
  authUpdatedAt: v.optional(v.number()),

  // Gamification & Statistics
  stats: userProfilesValidators.userStats,
  badges: v.array(v.string()),

  // Activity Tracking
  lastActiveAt: v.number(),
  lastLoginAt: v.number(),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),

  // Profile Status
  isActive: v.boolean(),
  isEmailVerified: v.boolean(),
  isProfileComplete: v.boolean(),

  // Extended metadata
  extendedMetadata: userProfilesValidators.extendedMetadata,

  // Standard metadata
  metadata: userProfilesValidators.metadata,

  // Audit fields (required per GUIDE pattern)
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes per GUIDE pattern
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name']) // Added for name-based lookups
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_email', ['email'])
  .index('by_role', ['role'])
  .index('by_is_active', ['isActive'])
  .index('by_last_active_at', ['lastActiveAt'])
  .index('by_created_at', ['createdAt']);
