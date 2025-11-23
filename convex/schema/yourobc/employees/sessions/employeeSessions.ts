// convex/schema/yourobc/employees/sessions/employeeSessions.ts
// Table definitions for employeeSessions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import {
  employeeSessionsValidators,
  employeeSessionsFields,
} from './validators';

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
