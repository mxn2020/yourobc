// convex/schema/software/yourobc/employeeSessions/employeeSessions.ts
/**
 * Employee Sessions Table Definition
 *
 * Defines the schema for employee session tracking in the YouROBC system.
 * Tracks login/logout times, work hours, activity status, and breaks.
 * This table supports real-time session monitoring with comprehensive
 * tracking of employee work hours and activity patterns.
 *
 * @module convex/schema/software/yourobc/employeeSessions/employeeSessions
 */

import { v } from 'convex/values'
import { defineTable } from 'convex/server'
import {
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base'
import {
  sessionTypeValidator,
  breakTypeValidator,
  deviceSchema,
  breakSchema,
} from './validators'

// ============================================================================
// Employee Sessions Table
// ============================================================================

/**
 * Employee Sessions table
 * Tracks real-time employee login/logout sessions with activity monitoring.
 * Each session represents a work period from login to logout with detailed
 * tracking of activity, breaks, and device information.
 *
 * Key Features:
 * - Real-time session tracking (login/logout)
 * - Activity monitoring (last activity, inactive detection)
 * - Break time tracking with detailed breakdown
 * - Device and location information
 * - Multi-state workflow with duration calculation
 * - Soft delete support
 *
 * Display Field: loginTime (primary session identifier as timestamp)
 */
export const employeeSessionsTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier (e.g., 'session_abc123')

  // Core Identity & References
  employeeId: v.id('yourobcEmployees'),
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),

  // Ownership
  ownerId: v.string(), // authUserId - session owner

  // Session Times
  loginTime: v.number(), // Main display field - session start timestamp
  logoutTime: v.optional(v.number()),
  duration: v.optional(v.number()), // in minutes, calculated on logout

  // Activity Tracking
  lastActivity: v.number(),
  isActive: v.boolean(), // false if inactive > 15 min
  inactivityStartTime: v.optional(v.number()), // when inactivity started

  // Session Metadata
  sessionType: sessionTypeValidator, // manual, automatic
  device: v.optional(deviceSchema),
  ipAddress: v.optional(v.string()),

  // Break Time Tracking
  breaks: v.array(breakSchema),

  // Classification & Metadata
  ...metadataSchema, // tags, category, customFields

  // Audit & Soft Delete
  ...auditFields, // createdAt, createdBy, updatedAt, updatedBy
  ...softDeleteFields, // deletedAt, deletedBy
})
  // Core indexes
  .index('by_public_id', ['publicId'])
  .index('by_login_time', ['loginTime'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created', ['createdAt'])

  // Employee and user indexes
  .index('by_employee', ['employeeId'])
  .index('by_user_profile', ['userProfileId'])
  .index('by_auth_user', ['authUserId'])

  // Activity indexes
  .index('by_is_active', ['isActive'])
  .index('by_last_activity', ['lastActivity'])

  // Session type and status indexes
  .index('by_session_type', ['sessionType'])

  // Composite indexes for common queries
  .index('by_employee_login', ['employeeId', 'loginTime'])
  .index('by_employee_active', ['employeeId', 'isActive'])
  .index('by_owner_deleted', ['ownerId', 'deletedAt'])
  .index('by_date_range', ['loginTime', 'logoutTime']) // For reporting

// ============================================================================
// Export
// ============================================================================

export default employeeSessionsTable
