// convex/schema/yourobc/supporting/wikiEntries.ts
/**
 * Wiki Entries Table Schema
 *
 * Tracks knowledge base articles and procedures.
 * Supports categorization, tagging, and view tracking.
 *
 * @module convex/schema/yourobc/supporting/wikiEntries
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { supportingValidators, supportingFields } from './validators'
import { auditFields, classificationFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';

/**
 * Wiki entries table
 * Tracks knowledge base articles and procedures
 */
export const wikiEntriesTable = defineTable({
  // Core fields
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  type: supportingValidators.wikiEntryType,
  isPublic: v.boolean(),
  status: supportingValidators.wikiStatus,
  viewCount: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),

  // Classification
  ...classificationFields,

  // Audit and soft delete fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_public', ['isPublic'])
  .index('by_deleted', ['deletedAt'])
  .index('by_created', ['createdAt'])
