// convex/schema/yourobc/statistics/officeCosts.ts
/**
 * Office Costs Table Schema
 *
 * Track rent, utilities, insurance, maintenance, and other office-related expenses.
 * Supports both one-time and recurring cost tracking.
 *
 * @module convex/schema/yourobc/statistics/officeCosts
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { statisticsValidators, statisticsFields } from './validators'
import { classificationFields } from '@/schema/base'

/**
 * Office costs table
 * Track rent, utilities, insurance, maintenance, and other office-related expenses.
 * Supports both one-time and recurring cost tracking.
 */
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
  ownerId: v.string(), // authUserId - who created/manages this cost entry
  isOfficial: v.optional(v.boolean()), // Official records vs estimates

  // Usage Statistics
  stats: v.optional(statisticsFields.stats), // Track if this is a template entry

  // Audit & Soft Delete
  ...statisticsFields.audit,
  ...statisticsFields.softDelete,

  // Cost Classification
  category: statisticsValidators.officeCostCategory, // rent, utilities, insurance, maintenance, supplies, technology, other
})
  .index('by_public_id', ['publicId'])
  .index('by_category', ['category'])
  .index('by_date', ['date'])
  .index('by_owner_id', ['ownerId'])
  .index('by_official', ['isOfficial'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])
