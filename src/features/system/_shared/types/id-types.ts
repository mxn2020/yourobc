// filepath: src/features/boilerplate/_shared/types/id-types.ts
/**
 * Shared ID Type Definitions
 *
 * This file defines the two primary ID types used throughout the application:
 *
 * 1. AuthUserId (string): External authentication identifier from Better Auth
 *    - Stored in Neon PostgreSQL by Better Auth
 *    - Used for authentication, permissions, and cross-system references
 *    - Format: string (e.g., "clx1234567890abcdef")
 *
 * 2. UserProfileId (Id<"userProfiles">): Internal Convex document identifier
 *    - Stored in Convex database
 *    - Used for internal Convex document operations only
 *    - Format: Convex ID object with __tableName property
 *
 * USAGE GUIDELINES:
 * ================
 *
 * Use AuthUserId when:
 * - Working with Better Auth operations (login, signup, admin functions)
 * - Querying Convex by authUserId field
 * - Passing user identity across system boundaries
 * - Implementing permissions and access control
 * - Referencing users in audit logs, analytics, etc.
 *
 * Use UserProfileId when:
 * - Directly accessing Convex documents with ctx.db.get()
 * - Internal Convex-only document references
 * - Relationships between Convex tables
 */

import type { Id } from "../../../../../convex/_generated/dataModel";

/**
 * Better Auth User ID (string)
 *
 * External authentication identifier from Better Auth stored in Neon PostgreSQL.
 * This is the primary identifier for user authentication and cross-system references.
 *
 * @example
 * const authUserId: AuthUserId = "clx1234567890abcdef";
 * await authClient.admin.banUser({ userId: authUserId });
 */
export type AuthUserId = string;

/**
 * Convex User Profile ID
 *
 * Internal Convex document identifier for user profile records.
 * Used only for direct Convex document operations.
 *
 * @example
 * const profileId: UserProfileId = "jx7abc123..." as Id<"userProfiles">;
 * const profile = await ctx.db.get(profileId);
 */
export type UserProfileId = Id<"userProfiles">;

/**
 * Type guard to check if a value is a valid AuthUserId (string)
 *
 * @param id - The value to check
 * @returns true if the value is a string (AuthUserId)
 *
 * @example
 * if (isAuthUserId(userId)) {
 *   await authClient.admin.setRole({ userId, role: "admin" });
 * }
 */
export function isAuthUserId(id: unknown): id is AuthUserId {
  return typeof id === "string" && id.length > 0;
}

/**
 * Type guard to check if a value is a valid UserProfileId (Convex ID)
 *
 * @param id - The value to check
 * @returns true if the value is a Convex ID object
 *
 * @example
 * if (isUserProfileId(id)) {
 *   const profile = await ctx.db.get(id);
 * }
 */
export function isUserProfileId(id: unknown): id is UserProfileId {
  return (
    typeof id === "object" &&
    id !== null &&
    "__tableName" in id &&
    (id as { __tableName: unknown }).__tableName === "userProfiles"
  );
}

/**
 * Validates that a string is a non-empty AuthUserId
 *
 * @param id - The AuthUserId to validate
 * @throws Error if the ID is invalid
 *
 * @example
 * validateAuthUserId(profile.authUserId); // throws if invalid
 */
export function validateAuthUserId(id: AuthUserId): asserts id is AuthUserId {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    throw new Error("Invalid AuthUserId: must be a non-empty string");
  }
}

/**
 * Validates that a value is a valid UserProfileId
 *
 * @param id - The UserProfileId to validate
 * @throws Error if the ID is invalid
 *
 * @example
 * validateUserProfileId(profileId); // throws if invalid
 */
export function validateUserProfileId(id: UserProfileId): asserts id is UserProfileId {
  if (!isUserProfileId(id)) {
    throw new Error(
      'Invalid UserProfileId: must be a Convex ID with __tableName "userProfiles"'
    );
  }
}

/**
 * Type for functions that accept either ID type
 * (Use sparingly - prefer explicit typing when possible)
 */
export type AnyUserId = AuthUserId | UserProfileId;

/**
 * Helper to determine which type of ID is provided
 *
 * @param id - The ID to check
 * @returns "auth" | "profile" | "unknown"
 *
 * @example
 * const idType = getIdType(userId);
 * if (idType === "auth") {
 *   // Handle Better Auth ID
 * } else if (idType === "profile") {
 *   // Handle Convex profile ID
 * }
 */
export function getIdType(id: unknown): "auth" | "profile" | "unknown" {
  if (isAuthUserId(id)) return "auth";
  if (isUserProfileId(id)) return "profile";
  return "unknown";
}
