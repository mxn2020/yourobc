// convex/schema/yourobc/employeeSessions/workHoursSummary.ts
/**
 * Work Hours Summary Table Definition
 *
 * Defines the schema for aggregated work hours summaries in the YouROBC system.
 * Stores pre-calculated work hour statistics per day/month for efficient reporting.
 * This table supports performance-optimized queries for work hours reporting.
 *
 * @module convex/schema/yourobc/employeeSessions/workHoursSummary
 */

import { v } from 'convex/values'
import { defineTable } from 'convex/server'
import {
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../base'

// ============================================================================
// Work Hours Summary Table
// ============================================================================

/**
 * Work Hours Summary table
 * Stores aggregated work hour statistics per employee per time period.
 * Each record represents a summary for a specific day or month with
 * pre-calculated metrics for efficient reporting and analytics.
 *
 * Key Features:
 * - Daily and monthly aggregations
 * - Total hours with break time breakdown
 * - Net work hours calculation
 * - Overtime tracking based on expected hours
 * - Session count tracking
 * - Performance-optimized for reporting queries
 * - Soft delete support
 *
 * Display Field: period (year/month/day combination)
 */
export const workHoursSummaryTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier (e.g., 'workhours_abc123')

  // Core Identity & References
  employeeId: v.id('yourobcEmployees'),

  // Ownership
  ownerId: v.string(), // authUserId - typically the employee or their manager

  // Time Period (main display field components)
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

  // Classification & Metadata
  ...metadataSchema, // tags, category, customFields

  // Audit & Soft Delete
  ...auditFields, // createdAt, createdBy, updatedAt, updatedBy
  ...softDeleteFields, // deletedAt, deletedBy
})
  // Core indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created', ['createdAt'])

  // Employee indexes
  .index('by_employee', ['employeeId'])

  // Time period indexes
  .index('by_year', ['year'])
  .index('by_year_month', ['year', 'month'])

  // Composite indexes for common queries
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_employee_month', ['employeeId', 'year', 'month'])
  .index('by_employee_day', ['employeeId', 'year', 'month', 'day'])
  .index('by_owner_deleted', ['ownerId', 'deletedAt'])

// ============================================================================
// Export
// ============================================================================

export default workHoursSummaryTable
