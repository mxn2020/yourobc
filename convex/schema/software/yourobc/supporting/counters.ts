// convex/schema/software/yourobc/supporting/counters.ts
/**
 * Counters Table Schema
 *
 * Manages auto-increment counters for various entity types.
 * Supports year-based reset patterns for reference numbers.
 *
 * @module convex/schema/software/yourobc/supporting/counters
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  counterTypeValidator,
  metadataSchema,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Counters table
 * Manages auto-increment counters for various entity types
 */
export const countersTable = defineTable({
  // Core fields
  type: counterTypeValidator,
  prefix: v.string(), // e.g., 'QT', 'SH', 'INV'
  year: v.number(),
  lastNumber: v.number(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_type_year', ['type', 'year'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
