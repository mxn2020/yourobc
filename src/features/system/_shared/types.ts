// filepath: src/features/system/_shared/types.ts
/**
 * Shared type definitions used across all system features
 *
 * This file provides core type aliases that ensure consistency
 * throughout the application, particularly around user identification.
 */

import type { Id } from '@/convex/_generated/dataModel'

// ============================================================================
// User ID Types
// ============================================================================

/**
 * Better Auth user ID - string format from external authentication system
 *
 * Use this for:
 * - Authentication context parameters in mutations/queries
 * - Audit trail fields (createdBy, updatedBy, deletedBy)
 * - Querying user profiles by auth ID
 * - Comparing with session user identity
 *
 * @example
 * ```typescript
 * // In a Convex mutation
 * export const createProject = mutation({
 *   args: { authUserId: v.string(), data: v.object({...}) },
 *   handler: async (ctx, { authUserId, data }) => {
 *     const user = await requireCurrentUser(ctx)
 *     // Use authUserId for audit trail
 *     const project = {
 *       ...data,
 *       createdBy: user._id,  // ✅ Id<"userProfiles"> for audit
 *       ownerId: user._id       // ✅ Id<"userProfiles"> for relationship
 *     }
 *   }
 * })
 * ```
 */
export type AuthUserId = string

/**
 * Convex user profile ID - internal Convex document ID
 *
 * Use this for:
 * - Database relationships (ownerId, userId, assignedTo fields)
 * - Foreign key references
 * - Convex document queries and filters
 * - Any field that creates a relationship between tables
 *
 * @example
 * ```typescript
 * // In schema definition
 * export const projectsTable = defineTable({
 *   ownerId: v.id("userProfiles"),           // ✅ Relationship
 *   collaborators: v.array(v.id("userProfiles")), // ✅ Relationship
 *   createdBy: user._id,  // ✅ Id<"userProfiles"> for audit
 * })
 *
 * // In TypeScript interface
 * export interface Project {
 *   _id: Id<"projects">
 *   ownerId: UserProfileId                   // ✅ Type-safe relationship
 *   createdBy?: AuthUserId                   // ✅ Type-safe audit
 * }
 * ```
 */
export type UserProfileId = Id<"userProfiles">

// ============================================================================
// Usage Guidelines
// ============================================================================

/**
 * CRITICAL DISTINCTION:
 *
 * These two ID types are NOT interchangeable:
 *
 * 1. AuthUserId (string)
 *    - Comes from: Better Auth authentication system
 *    - Stored in: userProfiles.authUserId field
 *    - Used for: Auth context, audit trails, logging
 *    - Example value: "abc123xyz"
 *
 * 2. UserProfileId (Id<"userProfiles">)
 *    - Comes from: Convex database
 *    - Stored in: userProfiles._id field
 *    - Used for: Relationships, foreign keys
 *    - Example value: Id<"userProfiles">
 *
 * MAPPING:
 * - Every user has ONE authUserId (from better-auth)
 * - Every user profile has ONE _id (from Convex)
 * - The authUserId is stored in the profile for lookup
 * - Use getCurrentUser(authUserId) to get the full profile with _id
 * - Use getUserProfileId(authUserId) to convert authUserId → UserProfileId
 *
 * COMMON MISTAKES TO AVOID:
 * ❌ const project = { ownerId: authUserId }  // Wrong: string → Id mismatch
 * ✅ const project = { ownerId: user._id }    // Correct: Id<"userProfiles">
 *
 * ❌ await requireOwnershipOrAdmin(ctx, authUserId, resource.createdBy) // If createdBy is string
 * ✅ await requireOwnershipOrAdmin(ctx, authUserId, resource.ownerId)   // If ownerId is Id<"userProfiles">
 *
 * ❌ const auditLog = { userId: authUserId }  // Wrong: userId should be Id
 * ✅ const auditLog = { userId: user._id, createdBy: user._id }  // Correct: both types
 */

// ============================================================================
// Type Guards (Future)
// ============================================================================

/**
 * Type guard to check if a value is an AuthUserId (string)
 */
export function isAuthUserId(value: unknown): value is AuthUserId {
  return typeof value === 'string' && value.length > 0
}

/**
 * Note: Type guard for UserProfileId is not practical since it's a branded type
 * at runtime it's just a string. Use TypeScript's type system instead.
 */
