// convex/schema/yourobc/employees/sessions/workHoursSummary.ts
// Table definitions for work hours summary in employeeSessions module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';

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
