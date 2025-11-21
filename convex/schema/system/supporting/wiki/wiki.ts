// convex/schema/system/supporting/wiki/wiki.ts
// Table definitions for wiki module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { wikiValidators } from './validators';

export const wikiTable = defineTable({
  // Required: Main display field
  title: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Required: Status
  status: wikiValidators.status,

  // Content and identification
  slug: v.string(),
  content: v.string(),
  summary: v.optional(v.string()),

  // Wiki-specific fields
  type: wikiValidators.type,
  visibility: wikiValidators.visibility,
  viewCount: v.optional(v.number()),
  lastViewedAt: v.optional(v.number()),

  // Categorization
  category: v.string(),
  tags: v.array(v.string()),

  // Search optimization
  searchableContent: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_title', ['title'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_visibility', ['visibility'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);
