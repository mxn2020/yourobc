import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { wikiEntriesValidators } from './validators';

export const wikiEntriesTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  type: wikiEntriesValidators.entryType,
  status: wikiEntriesValidators.entryStatus,
  slug: v.string(),
  title: v.string(),
  content: v.string(),
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  isPublic: v.optional(v.boolean()),
  viewCount: v.optional(v.number()),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_slug', ['slug'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_category', ['category'])
  .index('by_created_at', ['createdAt']);
