// convex/schema/system/supporting/counters.ts
/**
 * Counters Table Schema
 *
 * Manages auto-increment counters for various entity types.
 * Supports year-based reset patterns for reference numbers.
 *
 * @module convex/schema/system/supporting/counters
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * Counters table
 * Manages auto-increment counters for various entity types
 */
export const countersTable = defineTable({
  // Required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  name: v.string(),

  // Core fields
  type: supportingValidators.counterType,
  prefix: v.string(), // e.g., 'QT', 'SH', 'INV'
  year: v.number(),
  lastNumber: v.number(),

  // Metadata and audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_type_year', ['type', 'year'])
  .index('by_created_at', ['createdAt'])
