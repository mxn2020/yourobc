// convex/schema/system/dashboards/dashboards/dashboards.ts
// Table definitions for dashboards module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { dashboardsValidators } from './validators';

export const dashboardsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Module-specific fields
  description: v.optional(v.string()),
  layout: dashboardsValidators.layout,
  widgets: v.array(dashboardsValidators.widget),
  isDefault: v.boolean(),
  isPublic: v.boolean(),
  tags: v.optional(v.array(v.string())),

  // Standard metadata
  metadata: metadataSchema,

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_is_default', ['isDefault'])
  .index('by_is_public', ['isPublic'])
  .index('by_owner_and_is_default', ['ownerId', 'isDefault'])
  .index('by_created_at', ['createdAt']);
