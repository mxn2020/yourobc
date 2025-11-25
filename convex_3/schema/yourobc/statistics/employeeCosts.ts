// convex/schema/yourobc/statistics/employeeCosts.ts
/**
 * Employee Costs Table Schema
 *
 * Track employee salaries, benefits, bonuses, and other personnel costs.
 * Can track position-level costs even without a specific employee assignment.
 *
 * @module convex/schema/yourobc/statistics/employeeCosts
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statisticsValidators, statisticsFields } from './validators'
import { classificationFields } from '@/schema/base'

/**
 * Employee costs table
 * Track employee salaries, benefits, bonuses, and other personnel costs.
 * Can track position-level costs even without a specific employee assignment.
 */
export const employeeCostsTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Cost entry name (e.g., 'Senior Developer - Q1 2024')
  description: v.optional(v.string()), // Additional notes about this cost entry
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Employee Reference
  employeeId: v.optional(v.id('yourobcEmployees')), // Optional - can track position costs without specific employee
  employeeName: v.optional(v.string()),
  position: v.string(),
  department: v.optional(v.string()),

  // Cost Details
  monthlySalary: statisticsFields.currencyAmount,
  benefits: v.optional(statisticsFields.currencyAmount), // Health insurance, pension, etc.
  bonuses: v.optional(statisticsFields.currencyAmount),
  otherCosts: v.optional(statisticsFields.currencyAmount), // Training, equipment, etc.

  // Period
  startDate: v.number(),
  endDate: v.optional(v.number()), // null = ongoing

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Complexity of cost calculation
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official company records vs estimates

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...statisticsFields.audit,
  ...statisticsFields.softDelete,
})
  .index('by_public_id', ['publicId'])
  .index('by_employee_id', ['employeeId'])
  .index('by_start_date', ['startDate'])
  .index('by_department', ['department'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])
