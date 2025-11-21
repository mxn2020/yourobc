// convex/schema/yourobc/employeeSessions/validators.ts
/**
 * Employee Sessions Validators
 *
 * Convex validators for employee sessions module.
 * Defines status values and common nested objects used by the tables.
 */

import { v } from 'convex/values';

/**
 * Grouped validators for employee sessions module
 */
export const employeeSessionsValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('paused'),
    v.literal('completed')
  ),
  sessionType: v.union(
    v.literal('manual'),
    v.literal('automatic')
  ),
  breakType: v.union(
    v.literal('lunch'),
    v.literal('coffee'),
    v.literal('personal'),
    v.literal('meeting')
  )
} as const;

/**
 * Complex object schemas for employee sessions module
 */
export const employeeSessionsFields = {
  location: v.object({
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    address: v.optional(v.string()),
  }),
  device: v.object({
    userAgent: v.optional(v.string()),
    platform: v.optional(v.string()),
    browser: v.optional(v.string()),
  }),
  breakEntry: v.object({
    startTime: v.number(),
    endTime: v.optional(v.number()),
    type: employeeSessionsValidators.breakType,
    duration: v.optional(v.number()),
  }),
  activityLogEntry: v.object({
    timestamp: v.number(),
    action: v.string(),
    details: v.optional(v.string()),
  }),
} as const;
