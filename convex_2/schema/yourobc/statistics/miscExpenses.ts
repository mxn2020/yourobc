// convex/schema/yourobc/statistics/miscExpenses.ts
/**
 * Miscellaneous Expenses Table Schema
 *
 * Track trade shows, marketing, tools, software, travel, and other variable expenses.
 * Includes approval workflow for expense management.
 *
 * @module convex/schema/yourobc/statistics/miscExpenses
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statisticsValidators, statisticsFields } from './validators'
import { classificationFields } from '@/schema/base'

/**
 * Miscellaneous expenses table
 * Track trade shows, marketing, tools, software, travel, and other variable expenses.
 * Includes approval workflow for expense management.
 */
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
  ownerId: v.string(), // authUserId - who submitted this expense
  isOfficial: v.optional(v.boolean()), // Official expenses vs personal reimbursements

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...statisticsFields.audit,
  ...statisticsFields.softDelete,

  // Expense Classification
  category: statisticsValidators.miscExpenseCategory, // trade_show, marketing, tools, software, travel, entertainment, other
})
  .index('by_public_id', ['publicId'])
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_employee', ['relatedEmployeeId'])
  .index('by_approved', ['approved'])
  .index('by_owner', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
