// convex/schema/software/yourobc/employeeSessions/employeeSessions.ts
// Table definitions for employeeSessions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  sessionTypeValidator,
  breakTypeValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '@/schema/yourobc/base';
import { employeeSessionsValidators } from './validators';

export const employeeSessionsTable = defineTable({
  // Required: Main display field (sessionId as auto-generated identifier)
  sessionId: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Employee References
  employeeId: v.id('yourobcEmployees'),
  userProfileId: v.id('userProfiles'),
  authUserId: v.string(),

  // Session Times
  startTime: v.number(),
  endTime: v.optional(v.number()),
  duration: v.optional(v.number()), // in minutes

  // Location Tracking
  location: v.optional(v.object({
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
  })),

  // Activity Tracking
  lastActivity: v.number(),
  isActive: v.boolean(),
  inactivityStartTime: v.optional(v.number()),

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
    duration: v.optional(v.number()),
  })),

  // Activity Log
  activityLog: v.optional(v.array(v.object({
    timestamp: v.number(),
    action: v.string(),
    details: v.optional(v.string()),
  }))),

  // Status
  status: employeeSessionsValidators.status,

  // Notes
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
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
