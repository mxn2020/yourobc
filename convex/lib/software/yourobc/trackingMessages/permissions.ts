// convex/lib/software/yourobc/trackingMessages/permissions.ts
/**
 * Tracking Messages Permissions
 *
 * Authorization logic for tracking message operations.
 * Defines who can read, create, update, and delete tracking messages.
 *
 * Permission Rules:
 * - Read: Owner, official templates (public), or shared templates
 * - Create: Any authenticated user
 * - Update: Owner only
 * - Delete: Owner only (soft delete)
 *
 * @module convex/lib/software/yourobc/trackingMessages/permissions
 */

import type { TrackingMessage, PermissionCheckResult } from './types'

// ============================================================================
// Permission Check Functions
// ============================================================================

/**
 * Checks if a user can read a tracking message
 * Users can read their own messages, official templates, and public messages
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage} message - The tracking message to check
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canReadTrackingMessage(userId, message)
 * if (result.allowed) {
 *   // User can read the message
 * }
 */
export function canReadTrackingMessage(
  userId: string,
  message: TrackingMessage
): PermissionCheckResult {
  // Owner can always read
  if (message.ownerId === userId) {
    return { allowed: true }
  }

  // Official templates are readable by all
  if (message.isOfficial === true) {
    return { allowed: true }
  }

  // Public visibility allows all authenticated users to read
  if (message.visibility === 'public') {
    return { allowed: true }
  }

  // Shared visibility might allow reading (could be extended with sharing logic)
  if (message.visibility === 'shared') {
    return { allowed: true, reason: 'Shared template' }
  }

  return {
    allowed: false,
    reason: 'You do not have permission to read this tracking message',
  }
}

/**
 * Checks if a user can create a tracking message
 * Any authenticated user can create tracking messages
 *
 * @param {string} userId - The user's auth ID
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canCreateTrackingMessage(userId)
 * if (result.allowed) {
 *   // User can create messages
 * }
 */
export function canCreateTrackingMessage(userId: string): PermissionCheckResult {
  // Any authenticated user can create tracking messages
  if (!userId) {
    return {
      allowed: false,
      reason: 'You must be authenticated to create tracking messages',
    }
  }

  return { allowed: true }
}

/**
 * Checks if a user can update a tracking message
 * Only the owner can update their tracking messages
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage} message - The tracking message to check
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canUpdateTrackingMessage(userId, message)
 * if (result.allowed) {
 *   // User can update the message
 * }
 */
export function canUpdateTrackingMessage(
  userId: string,
  message: TrackingMessage
): PermissionCheckResult {
  // Only owner can update
  if (message.ownerId !== userId) {
    return {
      allowed: false,
      reason: 'You can only update your own tracking messages',
    }
  }

  // Cannot update deleted messages
  if (message.deletedAt) {
    return {
      allowed: false,
      reason: 'Cannot update deleted tracking messages',
    }
  }

  return { allowed: true }
}

/**
 * Checks if a user can delete a tracking message
 * Only the owner can delete their tracking messages
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage} message - The tracking message to check
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canDeleteTrackingMessage(userId, message)
 * if (result.allowed) {
 *   // User can delete the message
 * }
 */
export function canDeleteTrackingMessage(
  userId: string,
  message: TrackingMessage
): PermissionCheckResult {
  // Only owner can delete
  if (message.ownerId !== userId) {
    return {
      allowed: false,
      reason: 'You can only delete your own tracking messages',
    }
  }

  // Cannot delete already deleted messages
  if (message.deletedAt) {
    return {
      allowed: false,
      reason: 'This tracking message is already deleted',
    }
  }

  return { allowed: true }
}

/**
 * Checks if a user can restore a soft-deleted tracking message
 * Only the owner can restore their deleted tracking messages
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage} message - The tracking message to check
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canRestoreTrackingMessage(userId, message)
 * if (result.allowed) {
 *   // User can restore the message
 * }
 */
export function canRestoreTrackingMessage(
  userId: string,
  message: TrackingMessage
): PermissionCheckResult {
  // Only owner can restore
  if (message.ownerId !== userId) {
    return {
      allowed: false,
      reason: 'You can only restore your own tracking messages',
    }
  }

  // Can only restore deleted messages
  if (!message.deletedAt) {
    return {
      allowed: false,
      reason: 'This tracking message is not deleted',
    }
  }

  return { allowed: true }
}

/**
 * Checks if a user can mark a template as official
 * Only admins/system can mark templates as official (requires additional role check)
 *
 * @param {string} userId - The user's auth ID
 * @param {boolean} isAdmin - Whether the user is an admin
 * @returns {PermissionCheckResult} Permission check result
 *
 * @example
 * const result = canMarkAsOfficial(userId, isAdmin)
 * if (result.allowed) {
 *   // User can mark as official
 * }
 */
export function canMarkAsOfficial(
  userId: string,
  isAdmin: boolean = false
): PermissionCheckResult {
  if (!isAdmin) {
    return {
      allowed: false,
      reason: 'Only administrators can mark templates as official',
    }
  }

  return { allowed: true }
}

// ============================================================================
// Batch Permission Checks
// ============================================================================

/**
 * Filters a list of tracking messages to only include those the user can read
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage[]} messages - Array of tracking messages
 * @returns {TrackingMessage[]} Filtered messages
 *
 * @example
 * const readableMessages = filterReadableTrackingMessages(userId, allMessages)
 */
export function filterReadableTrackingMessages(
  userId: string,
  messages: TrackingMessage[]
): TrackingMessage[] {
  return messages.filter((message) => canReadTrackingMessage(userId, message).allowed)
}

/**
 * Checks permissions for multiple operations at once
 *
 * @param {string} userId - The user's auth ID
 * @param {TrackingMessage} message - The tracking message
 * @returns {Object} Permission results for all operations
 *
 * @example
 * const permissions = checkAllPermissions(userId, message)
 * // Returns: { canRead: true, canUpdate: false, canDelete: false }
 */
export function checkAllPermissions(
  userId: string,
  message: TrackingMessage
): {
  canRead: boolean
  canUpdate: boolean
  canDelete: boolean
  canRestore: boolean
} {
  return {
    canRead: canReadTrackingMessage(userId, message).allowed,
    canUpdate: canUpdateTrackingMessage(userId, message).allowed,
    canDelete: canDeleteTrackingMessage(userId, message).allowed,
    canRestore: canRestoreTrackingMessage(userId, message).allowed,
  }
}
