// convex/schema/yourobc/employeeSessions.ts
/**
 * YourOBC Employee Sessions Schema
 *
 * Defines schemas for employee session tracking, work hours, and activity monitoring.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * Tables:
 * - employeeSessionsTable: Real-time session and activity tracking
 * - workHoursSummaryTable: Aggregated work hours for reporting
 *
 * @module convex/schema/yourobc/employeeSessions
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  sessionTypeValidator,
  breakTypeValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Employee Sessions Table
// ============================================================================

/**
 * Employee Session Tracking
 * Tracks login/logout times, work hours, and activity status
 */
export const employeeSessionsTable = defineTable({
  employeeId: v.id('yourobcEmployees'),
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),

  // Session Times
  loginTime: v.number(),
  logoutTime: v.optional(v.number()),
  duration: v.optional(v.number()), // in minutes, calculated on logout

  // Activity Tracking
  lastActivity: v.number(),
  isActive: v.boolean(), // false if inactive > 15 min
  inactivityStartTime: v.optional(v.number()), // when inactivity started

  // Session Metadata
  sessionType: sessionTypeValidator,
  device: v.optional(v.object({
    userAgent: v.optional(v.string()),
    platform: v.optional(v.string()),
    browser: v.optional(v.string()),
  })),
  ipAddress: v.optional(v.string()),

  // Break Time Tracking
  breaks: v.array(v.object({
    startTime: v.number(),
    endTime: v.optional(v.number()),
    type: breakTypeValidator,
    duration: v.optional(v.number()), // in minutes
  })),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('employee', ['employeeId'])
  .index('userProfile', ['userProfileId'])
  .index('authUserId', ['authUserId'])
  .index('loginTime', ['loginTime'])
  .index('isActive', ['isActive'])
  .index('employee_login', ['employeeId', 'loginTime'])
  .index('employee_active', ['employeeId', 'isActive'])
  .index('date_range', ['loginTime', 'logoutTime']) // For reporting

// ============================================================================
// Work Hours Summary Table
// ============================================================================

/**
 * Work Hours Summary
 * Aggregated work hours per day/month for reporting
 */
export const workHoursSummaryTable = defineTable({
  employeeId: v.id('yourobcEmployees'),

  // Time Period
  year: v.number(),
  month: v.number(),
  day: v.optional(v.number()), // null for monthly aggregates

  // Hours Worked
  totalMinutes: v.number(),
  totalHours: v.number(), // totalMinutes / 60
  breakMinutes: v.number(),
  netMinutes: v.number(), // totalMinutes - breakMinutes
  netHours: v.number(), // netMinutes / 60

  // Session Count
  sessionCount: v.number(),

  // Overtime Tracking
  regularHours: v.number(), // based on expected hours per day
  overtimeHours: v.number(),
  expectedHours: v.number(), // standard work hours for the period

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_month', ['employeeId', 'year', 'month'])
  .index('employee_day', ['employeeId', 'year', 'month', 'day'])
  .index('year_month', ['year', 'month'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (sessionTypeValidator, breakTypeValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, metadataSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for metadata/audit fields: ...metadataSchema, ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit or metadata fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Employee Sessions Table:
 *    - Real-time session tracking (login/logout)
 *    - Active sessions: logoutTime is null
 *    - Duration: Calculated on logout (in minutes)
 *    - Activity monitoring: lastActivity timestamp, isActive flag
 *    - Inactivity detection: Track when inactivity started (>15 min = inactive)
 *
 * 2. Session Types:
 *    - sessionType: Uses sessionTypeValidator from base.ts
 *    - 'manual': Explicitly logged in/out by user
 *    - 'automatic': System-detected activity
 *
 * 3. Activity Tracking:
 *    - lastActivity: Updated on every user interaction
 *    - isActive: Auto-set to false after 15 minutes of inactivity
 *    - inactivityStartTime: When inactivity period began
 *
 * 4. Device & Location:
 *    - device: Optional browser/platform information
 *    - ipAddress: For security and location tracking
 *    - userAgent, platform, browser: For analytics
 *
 * 5. Break Time Tracking:
 *    - breaks: Array of break periods
 *    - Each break has: startTime, endTime, type, duration
 *    - breakType: Uses breakTypeValidator (lunch, coffee, personal, meeting)
 *    - Active break: endTime is null
 *    - Duration: Calculated when break ends
 *
 * 6. Work Hours Summary Table:
 *    - Aggregated data from sessions for performance
 *    - Daily summaries: year + month + day
 *    - Monthly summaries: year + month (day = null)
 *    - Metrics: total time, break time, net time
 *    - Overtime calculation: Based on expected hours
 *
 * 7. Time Calculations:
 *    - totalMinutes/totalHours: All login time
 *    - breakMinutes: Sum of all breaks
 *    - netMinutes/netHours: Total minus breaks
 *    - overtimeHours: Calculated against expectedHours
 *
 * 8. Reporting:
 *    - Daily reports: Use employee_day index
 *    - Monthly reports: Use employee_month index
 *    - Company-wide: Use year_month index
 *    - Date ranges: Use date_range index on sessions
 *
 * 9. Indexes:
 *    - employee: All sessions for an employee
 *    - employee_login: Sessions sorted by login time
 *    - employee_active: Active/inactive sessions
 *    - isActive: All currently active sessions
 *    - date_range: Time-based queries for reporting
 */
