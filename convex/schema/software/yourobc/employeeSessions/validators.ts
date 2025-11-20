// convex/schema/software/yourobc/employeeSessions/validators.ts
/**
 * Employee Sessions Validators
 *
 * Defines Convex validators for employee session tracking.
 * These validators ensure data integrity for session status, break types,
 * and other session-specific fields.
 *
 * @module convex/schema/software/yourobc/employeeSessions/validators
 */

import { v } from 'convex/values'

// ============================================================================
// Session Type Validators
// ============================================================================

/**
 * Session type validator
 * Tracks how the session was created
 */
export const sessionTypeValidator = v.union(
  v.literal('manual'),
  v.literal('automatic')
)

/**
 * Break type validator
 * Categorizes different types of breaks
 */
export const breakTypeValidator = v.union(
  v.literal('lunch'),
  v.literal('coffee'),
  v.literal('personal'),
  v.literal('meeting')
)

// ============================================================================
// Device Schema Validator
// ============================================================================

/**
 * Device information schema
 * Tracks device details for session
 */
export const deviceSchema = v.object({
  userAgent: v.optional(v.string()),
  platform: v.optional(v.string()),
  browser: v.optional(v.string()),
})

/**
 * Break schema validator
 * Tracks individual break periods
 */
export const breakSchema = v.object({
  startTime: v.number(),
  endTime: v.optional(v.number()),
  type: breakTypeValidator,
  duration: v.optional(v.number()), // in minutes
})

// ============================================================================
// Export Validators
// ============================================================================

export const employeeSessionsValidators = {
  sessionType: sessionTypeValidator,
  breakType: breakTypeValidator,
  device: deviceSchema,
  break: breakSchema,
} as const
