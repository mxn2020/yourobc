// convex/schema/yourobc/employees/sessions/tables.ts
// Combined table definitions for employee sessions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { employeeSessionsFields, employeeSessionsValidators } from './validators';

export const employeeSessionsTable = defineTable({
  // Required: Main display field (sessionId as auto-generated identifier)
  sessionId: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who created/owns this session record

  // Employee References (Multiple user references for different purposes)
  employeeId: v.id('yourobcEmployees'), // The employee record this session belongs to
  userProfileId: v.id('userProfiles'), // The Convex user profile for this employee
  authUserId: v.string(), // External auth system ID (BetterAuth)

  // Session Times
  startTime: v.number(),
  endTime: v.optional(v.number()),
  duration: v.optional(v.number()), // in minutes

  // Location Tracking
  location: v.optional(employeeSessionsFields.location),

  // Activity Tracking
  lastActivity: v.number(),
  isActive: v.boolean(),
  inactivityStartTime: v.optional(v.number()),

  // Session Metadata
  sessionType: employeeSessionsValidators.sessionType,
  device: v.optional(employeeSessionsFields.device),
  ipAddress: v.optional(v.string()),

  // Break Time Tracking
  breaks: v.array(employeeSessionsFields.breakEntry),

  // Activity Log
  activityLog: v.optional(v.array(employeeSessionsFields.activityLogEntry)),

  // Status
  status: employeeSessionsValidators.status,

  // Notes
  notes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_sessionId', ['sessionId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_employee', ['employeeId'])
  .index('by_userProfile', ['userProfileId'])
  .index('by_authUserId', ['authUserId'])
  .index('by_startTime', ['startTime'])
  .index('by_status', ['status'])
  .index('by_isActive', ['isActive'])
  .index('by_employee_startTime', ['employeeId', 'startTime'])
  .index('by_employee_status', ['employeeId', 'status'])
  .index('by_owner_and_status', ['ownerId', 'status']);

export const workHoursSummaryTable = defineTable({
  // Public Identity
  publicId: v.string(),

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
  .index('by_owner_deleted', ['ownerId', 'deletedAt']);
