// convex/schema/yourobc/statistics.ts
/**
 * YourOBC Statistics Schema
 *
 * Defines schemas for operating costs, KPI tracking, and performance metrics.
 * This module handles employee costs, office expenses, miscellaneous expenses,
 * KPI targets, and cached performance metrics for reporting and analytics.
 * Follows the template pattern with full compliance for maintainability.
 *
 * @module convex/schema/yourobc/statistics
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  officeCostCategoryValidator,
  costFrequencyValidator,
  miscExpenseCategoryValidator,
  targetTypeValidator,
  kpiCacheTypeValidator,
  difficultyValidator,
  visibilityValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
  metadataSchema,
  statsSchema,
} from './base'

// ============================================================================
// Operating Costs - Employee Costs
// ============================================================================

/**
 * Employee costs table
 * Track employee salaries, benefits, bonuses, and other personnel costs.
 * Can track position-level costs even without a specific employee assignment.
 */
export const employeeCostsTable = defineTable({
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
  monthlySalary: currencyAmountSchema,
  benefits: v.optional(currencyAmountSchema), // Health insurance, pension, etc.
  bonuses: v.optional(currencyAmountSchema),
  otherCosts: v.optional(currencyAmountSchema), // Training, equipment, etc.

  // Period
  startDate: v.number(),
  endDate: v.optional(v.number()), // null = ongoing

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Complexity of cost calculation
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official company records vs estimates

  // Usage Statistics
  stats: v.optional(statsSchema), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_employee', ['employeeId'])
  .index('by_start_date', ['startDate'])
  .index('by_department', ['department'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Operating Costs - Office Costs
// ============================================================================

/**
 * Office costs table
 * Track rent, utilities, insurance, maintenance, and other office-related expenses.
 * Supports both one-time and recurring cost tracking.
 */
export const officeCostsTable = defineTable({
  // Core Identity
  name: v.string(), // Cost entry name (e.g., 'Office Rent - January 2024')
  description: v.string(), // Detailed description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Cost Details
  amount: currencyAmountSchema,
  frequency: costFrequencyValidator, // one_time, monthly, quarterly, yearly

  // Period
  date: v.number(), // For one-time, or start date for recurring
  endDate: v.optional(v.number()), // For recurring costs

  // Vendor/Provider
  vendor: v.optional(v.string()),

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Complexity of cost tracking
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official records vs estimates

  // Usage Statistics
  stats: v.optional(statsSchema), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,

    // Cost Classification
  category: officeCostCategoryValidator, // rent, utilities, insurance, maintenance, supplies, technology, other
})
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Operating Costs - Miscellaneous Expenses
// ============================================================================

/**
 * Miscellaneous expenses table
 * Track trade shows, marketing, tools, software, travel, and other variable expenses.
 * Includes approval workflow for expense management.
 */
export const miscExpensesTable = defineTable({
  // Core Identity
  name: v.string(), // Expense name (e.g., 'Trade Show Booth - DMEXCO 2024')
  description: v.string(), // Detailed description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Cost Details
  amount: currencyAmountSchema,

  // Period
  date: v.number(),

  // Related Entities
  relatedEmployeeId: v.optional(v.id('yourobcEmployees')),
  relatedProjectId: v.optional(v.id('projects')),

  // Additional Details
  vendor: v.optional(v.string()),
  receiptUrl: v.optional(v.string()),

  // Approval Workflow
  approved: v.boolean(),
  approvedBy: v.optional(v.string()),
  approvedDate: v.optional(v.number()),

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Complexity of expense
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who submitted this expense
  isOfficial: v.optional(v.boolean()), // Official expenses vs personal reimbursements

  // Usage Statistics
  stats: v.optional(statsSchema), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,

  // Expense Classification
  category: miscExpenseCategoryValidator, // trade_show, marketing, tools, software, travel, entertainment, other
})
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_employee', ['relatedEmployeeId'])
  .index('by_approved', ['approved'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// KPI Targets
// ============================================================================

/**
 * KPI targets table
 * Set performance targets for employees, teams, or the entire company.
 * Supports monthly, quarterly, and yearly target periods.
 */
export const kpiTargetsTable = defineTable({
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
  .index('by_employee_year', ['employeeId', 'year'])
  .index('by_year_month', ['year', 'month'])
  .index('by_team_year', ['teamName', 'year'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])

// ============================================================================
// KPI Cache
// ============================================================================

/**
 * KPI cache table
 * Pre-calculated KPIs for performance optimization and reporting.
 * Stores computed metrics for employees, customers, departments, and company-wide.
 */
export const kpiCacheTable = defineTable({
  // Core Identity
  name: v.string(), // Cache entry name (e.g., 'Employee KPI - John Doe - Jan 2024')
  description: v.optional(v.string()), // Cache description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Scope
  cacheType: kpiCacheTypeValidator, // employee, customer, company, department
  entityId: v.optional(v.string()), // employeeId, customerId, etc.
  entityName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()),
  quarter: v.optional(v.number()),

  // Revenue Metrics
  totalRevenue: currencyAmountSchema,
  totalCost: v.optional(currencyAmountSchema),
  totalMargin: currencyAmountSchema,
  averageMargin: currencyAmountSchema,

  // Quote Metrics
  quoteCount: v.number(),
  averageQuoteValue: currencyAmountSchema,

  // Order Metrics
  orderCount: v.number(),
  averageOrderValue: currencyAmountSchema,
  averageMarginPerOrder: currencyAmountSchema,

  // Conversion Metrics
  conversionRate: v.number(), // Percentage

  // Commission
  totalCommission: v.optional(currencyAmountSchema),

  // Comparison
  previousPeriodRevenue: v.optional(currencyAmountSchema),
  previousPeriodMargin: v.optional(currencyAmountSchema),
  growthRate: v.optional(v.number()), // Percentage

  // Cache Metadata
  calculatedAt: v.number(),
  calculatedBy: v.string(),

  // Classification
  ...metadataSchema, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(difficultyValidator), // Complexity of calculations
  visibility: v.optional(visibilityValidator), // public, private, shared, organization

  // Ownership
  ownerId: v.string(), // authUserId - who owns this cache entry
  isOfficial: v.optional(v.boolean()), // Official cache vs test/experimental

  // Usage Statistics
  stats: v.optional(statsSchema), // Track cache usage

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_cache_type', ['cacheType'])
  .index('by_entity_year_month', ['entityId', 'year', 'month'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
