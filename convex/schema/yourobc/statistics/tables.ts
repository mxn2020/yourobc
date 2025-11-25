// convex/schema/yourobc/statistics/tables.ts
// Combined table definitions for statistics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields } from '@/schema/base';
import { statisticsFields, statisticsValidators } from './validators';

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
  ownerId: v.id('userProfiles'), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official company records vs estimates

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_employee_id', ['employeeId'])
  .index('by_start_date', ['startDate'])
  .index('by_department', ['department'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

export const officeCostsTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Cost entry name (e.g., 'Office Rent - January 2024')
  description: v.string(), // Detailed description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Cost Details
  amount: statisticsFields.currencyAmount,
  frequency: statisticsValidators.costFrequency, // one_time, monthly, quarterly, yearly

  // Period
  date: v.number(), // For one-time, or start date for recurring
  endDate: v.optional(v.number()), // For recurring costs

  // Vendor/Provider
  vendor: v.optional(v.string()),

  // Notes
  notes: v.optional(v.string()),

  // Classification
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Complexity of cost tracking
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.id('userProfiles'), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official records vs estimates

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,

  // Cost Classification
  category: statisticsValidators.officeCostCategory, // rent, utilities, insurance, maintenance, supplies, technology, other
})
  .index('by_public_id', ['publicId'])
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

export const miscExpensesTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Expense name (e.g., 'Trade Show Booth - DMEXCO 2024')
  description: v.string(), // Detailed description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Cost Details
  amount: statisticsFields.currencyAmount,

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
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Complexity of expense
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.id('userProfiles'), // authUserId - who submitted this expense
  isOfficial: v.optional(v.boolean()), // Official expenses vs personal reimbursements

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,

  // Expense Classification
  category: statisticsValidators.miscExpenseCategory, // trade_show, marketing, tools, software, travel, entertainment, other
})
  .index('by_public_id', ['publicId'])
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_employee_id', ['relatedEmployeeId'])
  .index('by_approved', ['approved'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

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
  ownerId: v.id('userProfiles'), // authUserId - who set these targets
  isOfficial: v.optional(v.boolean()), // Official company targets vs personal goals

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_employee_id_year', ['employeeId', 'year'])
  .index('by_year_month', ['year', 'month'])
  .index('by_team_name_year', ['teamName', 'year'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);

export const kpiCacheTable = defineTable({
  // Public Identity
  publicId: v.string(), // Public-facing unique identifier

  // Core Identity
  name: v.string(), // Cache entry name (e.g., 'Employee KPI - John Doe - Jan 2024')
  description: v.optional(v.string()), // Cache description
  icon: v.optional(v.string()), // Icon identifier
  thumbnail: v.optional(v.string()), // Preview image if applicable

  // Scope
  cacheType: statisticsValidators.kpiCacheType, // employee, customer, company, department
  entityId: v.optional(v.string()), // employeeId, customerId, etc.
  entityName: v.optional(v.string()),

  // Period
  year: v.number(),
  month: v.optional(v.number()),
  quarter: v.optional(v.number()),

  // Revenue Metrics
  totalRevenue: statisticsFields.currencyAmount,
  totalCost: v.optional(statisticsFields.currencyAmount),
  totalMargin: statisticsFields.currencyAmount,
  averageMargin: statisticsFields.currencyAmount,

  // Quote Metrics
  quoteCount: v.number(),
  averageQuoteValue: statisticsFields.currencyAmount,

  // Order Metrics
  orderCount: v.number(),
  averageOrderValue: statisticsFields.currencyAmount,
  averageMarginPerOrder: statisticsFields.currencyAmount,

  // Conversion Metrics
  conversionRate: v.number(), // Percentage

  // Commission
  totalCommission: v.optional(statisticsFields.currencyAmount),

  // Comparison
  previousPeriodRevenue: v.optional(statisticsFields.currencyAmount),
  previousPeriodMargin: v.optional(statisticsFields.currencyAmount),
  growthRate: v.optional(v.number()), // Percentage

  // Cache Metadata
  calculatedAt: v.number(),
  calculatedBy: v.string(),

  // Classification
  ...classificationFields, // tags, category, customFields
  useCase: v.optional(v.string()), // Use case description
  difficulty: v.optional(statisticsValidators.difficulty), // Complexity of calculations
  visibility: v.optional(statisticsValidators.visibility), // public, private, shared, organization

  // Ownership
  ownerId: v.id('userProfiles'), // authUserId - who owns this cache entry
  isOfficial: v.optional(v.boolean()), // Official cache vs test/experimental

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track cache usage

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_cache_type', ['cacheType'])
  .index('by_entity_id_year_month', ['entityId', 'year', 'month'])
  .index('by_year_month', ['year', 'month'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_category', ['category'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
