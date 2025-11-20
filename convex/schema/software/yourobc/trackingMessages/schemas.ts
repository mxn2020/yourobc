// convex/schema/software/yourobc/trackingMessages/schemas.ts
/**
 * Tracking Messages Schemas Export
 *
 * Exports the tracking messages table schema for inclusion in the main database schema.
 * This file serves as the single source of truth for all tracking message schemas.
 *
 * @module convex/schema/software/yourobc/trackingMessages/schemas
 */

import { trackingMessagesTable } from './trackingMessages'

// ============================================================================
// Schema Export
// ============================================================================

/**
 * Tracking messages schemas
 * Exports all table definitions for this entity
 */
export const trackingMessagesSchemas = {
  trackingMessages: trackingMessagesTable,
} as const

export default trackingMessagesSchemas
