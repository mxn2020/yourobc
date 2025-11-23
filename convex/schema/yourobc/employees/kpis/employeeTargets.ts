// convex/schema/yourobc/employees/kpis/employeeTargets.ts
/**
 * Employee Targets Table
 *
 * Individual targets set by admin/manager for employees.
 * Supports yearly, quarterly, and monthly targets.
 *
 * @module convex/schema/yourobc/employees/kpis/employeeTargets
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { auditFields, softDeleteFields } from '@/schema/base'

/**
 * Employee Targets Table
 * Individual targets set by admin/manager for performance tracking
 */
export const employeeTargetsTable = defineTable({
  // Identity
  publicId: v.string(), // Public-facing identifier (e.g., TARGET-2024-Q1-001)
  ownerId: v.string(), // authUserId who owns this target record

  // Employee Reference
  employeeId: v.id('yourobcEmployees'),

  // Optional KPI Reference (links to specific KPI record)
  kpiId: v.optional(v.id('yourobcEmployeeKPIs')),

  // Time Period
  year: v.number(),
  month: v.optional(v.number()), // null for yearly targets
  quarter: v.optional(v.number()), // 1, 2, 3, or 4
  period: v.string(), // Display field: "2024-Q1", "2024-03", "2024"

  // Target Values
  quotesTarget: v.optional(v.number()),
  ordersTarget: v.optional(v.number()),
  revenueTarget: v.optional(v.number()),
  conversionTarget: v.optional(v.number()), // percentage
  commissionsTarget: v.optional(v.number()),

  // Target Metadata
  setBy: v.string(), // authUserId who set the target
  setDate: v.number(),
  notes: v.optional(v.string()),

  // Standard fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_kpiId', ['kpiId'])
  .index('employee', ['employeeId'])
  .index('employee_year', ['employeeId', 'year'])
  .index('employee_period', ['employeeId', 'year', 'month'])
  .index('year_month', ['year', 'month'])
  .searchIndex('search_period', {
    searchField: 'period',
  })
