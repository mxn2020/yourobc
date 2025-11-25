// convex/schema/yourobc/supporting/wiki_entries/wiki_entries.ts
// Table definitions for wiki entries module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields } from '@/schema/base';
import { wikiEntriesValidators } from './validators';

/**
 * Wiki entries table
 * Tracks knowledge base articles and procedures
 */
export const wikiEntriesTable = defineTable({
  // Core fields
  title: v.string(),
  slug: v.string(),
  content: v.string(),
  type: wikiEntriesValidators.wikiEntryType,
  isPublic: v.boolean(),
  status: wikiEntriesValidators.wikiStatus,
  viewCount: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),

  // Classification
  ...classificationFields,

  // Audit and soft delete fields
  ...auditFields,
  ...softDeleteFields,
})
  // Standard required indexes
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_public', ['isPublic'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
