// convex/schema/software/yourobc/employeeSessions/types.ts
/**
 * Employee Sessions Schema Types
 *
 * TypeScript types derived from Convex validators for employee sessions.
 * These types ensure type safety when working with session and work hours data.
 *
 * @module convex/schema/software/yourobc/employeeSessions/types
 */

import { Infer } from 'convex/values'
import {
  sessionTypeValidator,
  breakTypeValidator,
  deviceSchema,
  breakSchema,
} from './validators'

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Session type
 * - manual: Session explicitly logged in/out by user
 * - automatic: Session created automatically by system activity detection
 */
export type SessionType = Infer<typeof sessionTypeValidator>

/**
 * Break type
 * - lunch: Lunch break
 * - coffee: Coffee/snack break
 * - personal: Personal break
 * - meeting: Meeting (internal or external)
 */
export type BreakType = Infer<typeof breakTypeValidator>

/**
 * Device information type
 * Contains browser and platform information for the session
 */
export type DeviceInfo = Infer<typeof deviceSchema>

/**
 * Break entry type
 * Represents a single break period within a session
 */
export type BreakEntry = Infer<typeof breakSchema>

// ============================================================================
// Export Types
// ============================================================================

export const employeeSessionsTypes = {
  SessionType: {} as SessionType,
  BreakType: {} as BreakType,
  DeviceInfo: {} as DeviceInfo,
  BreakEntry: {} as BreakEntry,
} as const
