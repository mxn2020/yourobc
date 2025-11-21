// convex/schema/software/yourobc/statistics/kpiTargets.ts
/**
 * KPI Targets Table Schema
 *
 * Set performance targets for employees, teams, or the entire company.
 * Supports monthly, quarterly, and yearly target periods.
 *
 * @module convex/schema/software/yourobc/statistics/kpiTargets
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  currencyAmountSchema,
  targetTypeValidator,
  difficultyValidator,
  visibilityValidator,
  metadataSchema,
  statsSchema,
  auditFields,
  softDeleteFields,
} from './validators'

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
  targetType: targetTypeValidator, // employee, team, company
  employeeId: v.optional(v.id('yourobcEmployees')),
  teamName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()), // null = yearly target
  quarter: v.optional(v.number()), // 1-4

  // Performance Targets
  revenueTarget: v.optional(currencyAmountSchema),
  marginTarget: v.optional(currencyAmountSchema),
  quoteCountTarget: v.optional(v.number()),
  orderCountTarget: v.optional(v.number()),
  conversionRateTarget: v.optional(v.number()), // Percentage
  averageMarginTarget: v.optional(currencyAmountSchema),

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Target difficulty level
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who set these targets
  isOfficial: v.optional(v.boolean()), // Official company targets vs personal goals

  // Usage Statistics
  stats: v.optional(statsSchema), // Track if this is a template

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_year_month', ['year', 'month'])
  .index('by_team_year', ['teamName', 'year'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
