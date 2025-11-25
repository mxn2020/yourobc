// convex/schema/{category}/{entity}/{module}/tables.ts
// Table definitions for {module} module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { {module}Validators, {module}Fields } from './validators';

/**
 * {Module} table definition
 */
export const {module}Table = defineTable({
  // Main display field (CHOOSE ONE - 'name', 'title', or 'displayName')
  {displayField}: v.string(),

  // Core required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Denormalized search field (ONLY if searchIndex is defined below)
  // Remove this field entirely if not using search
  searchableText: v.string(),

  // Module-specific fields
  description: v.optional(v.string()),
  status: {module}Validators.status,
  priority: v.optional({module}Validators.priority),
  visibility: v.optional({module}Validators.visibility),

  // Complex fields
  dimensions: v.optional({module}Fields.dimensions),

  // Optional relationships (only add if domain requires them)
  parentId: v.optional(v.id('{tableName}')),
  categoryId: v.optional(v.id('categories')),

  // Tags
  tags: v.optional(v.array(v.string())),

  // Audit fields (always required)
  ...auditFields,
  ...softDeleteFields,
})
  // Full-text search index (optional - see SearchIndex Decision Guide)
  // Remove this section if not using search
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  })

  // Standard indexes (always required)
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])  // or by_title, by_displayName
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Common optional indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_owner_and_category', ['ownerId', 'categoryId'])
  .index('by_parent', ['parentId'])
  .index('by_category', ['categoryId'])
  .index('by_created_at', ['createdAt']);

  // Add more indexes as needed...

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating tables.ts:
 * [ ] Choose correct display field (name/title/displayName)
 * [ ] Add publicId and ownerId fields
 * [ ] Import validators from ./validators
 * [ ] Use validators for all union types
 * [ ] Spread auditFields and softDeleteFields
 * [ ] Add required indexes (by_public_id, by_name, by_owner_id, by_deleted_at)
 * [ ] Add optional indexes based on query patterns
 * [ ] Decide if searchIndex is needed
 * [ ] Add/remove searchableText field based on search needs
 * [ ] Export as {module}Table
 *
 * DO:
 * [ ] Use validators from ./validators
 * [ ] Add index for display field
 * [ ] Make ownerId required for domain tables
 * [ ] Use v.optional() for optional fields
 * [ ] Document exemptions if skipping required fields
 *
 * DON'T:
 * [ ] Define inline unions (use validators)
 * [ ] Skip required indexes
 * [ ] Add searchableText without searchIndex
 * [ ] Add searchIndex without searchableText
 * [ ] Use generic index names (by_owner vs by_owner_id)
 */
