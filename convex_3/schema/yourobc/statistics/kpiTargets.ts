// convex/schema/yourobc/statistics/kpiTargets.ts
/**
 * KPI Targets Table Schema
 *
 * Set performance targets for employees, teams, or the entire company.
 * Supports monthly, quarterly, and yearly target periods.
 *
 * @module convex/schema/yourobc/statistics/kpiTargets
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statisticsValidators, statisticsFields } from './validators'
import { classificationFields } from '@/schema/base'

/**
 * KPI targets table
 * Set performance targets for employees, teams, or the entire company.
 * Supports monthly, quarterly, and yearly target periods.
 */
export const kpiTargetsTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Target name (e.g., 'Q1 2024 Sales Team Targets')
  description: v.optional(v.string()), // Target description/context
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Target Scope
  targetType: statisticsValidators.targetType, // employee, team, company
  employeeId: v.optional(v.id('yourobcEmployees')),
  teamName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()), // null = yearly target
  quarter: v.optional(v.number()), // 1-4

  // Performance Targets
  revenueTarget: v.optional(statisticsFields.currencyAmount),
  marginTarget: v.optional(statisticsFields.currencyAmount),
  quoteCountTarget: v.optional(v.number()),
  orderCountTarget: v.optional(v.number()),
  conversionRateTarget: v.optional(v.number()), // Percentage
  averageMarginTarget: v.optional(statisticsFields.currencyAmount),

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Target difficulty level
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who set these targets
  isOfficial: v.optional(v.boolean()), // Official company targets vs personal goals

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template

  // Audit & Soft Delete
  ...statisticsFields.audit,
  ...statisticsFields.softDelete,
})
  .index('by_public_id', ['publicId'])
  .index('by_employee_id_year', ['employeeId', 'year'])
  .index('by_year_month', ['year', 'month'])
  .index('by_team_name_year', ['teamName', 'year'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])
