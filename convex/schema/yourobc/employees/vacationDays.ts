// convex/schema/yourobc/employees/vacationDays.ts
/**
 * Vacation Days Table Schema
 *
 * Manages employee vacation day entitlements, usage, and approval workflow
 * with automatic calculations and carryover support.
 *
 * @module convex/schema/yourobc/employees/vacationDays
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { vacationEntryValidator } from './validators'
import { auditFields, softDeleteFields } from '../../base'

/**
 * Vacation days tracking table
 * Manages employee vacation day entitlements, usage, and approval workflow
 */
export const vacationDaysTable = defineTable({
  // Core Identity
  publicId: v.string(), // Public-facing unique identifier
  ownerId: v.string(), // Owner authUserId for permissions

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),
  year: v.number(),

  // Entitlement Calculation
  annualEntitlement: v.number(), // Base annual days (e.g., 20 or 25)
  carryoverDays: v.number(), // Days carried over from previous year
  carryoverApprovedBy: v.optional(v.string()), // AuthUserId who approved carryover
  carryoverApprovedAt: v.optional(v.number()), // When carryover was approved
  available: v.number(), // annualEntitlement + carryoverDays - used
  used: v.number(),
  pending: v.number(), // Days in pending approval state
  remaining: v.number(), // available - pending - used

  // Calculation Metadata
  calculationDate: v.optional(v.number()), // When auto-calculation was last run
  hireAnniversaryAdjustment: v.optional(v.number()), // Pro-rated adjustment for hire date

  // Vacation Entries
  entries: v.array(vacationEntryValidator),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_employee', ['employeeId'])
  .index('by_year', ['year'])
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
