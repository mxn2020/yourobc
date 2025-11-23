// convex/schema/system/dashboards/dashboards.ts
// Table definitions for dashboards module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, classificationFields, softDeleteFields } from '@/schema/base';
import { dashboardsFields, dashboardsValidators } from './validators';

export const dashboardsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Dashboard metadata
  description: v.optional(v.string()),
  layout: dashboardsValidators.layout,
  widgets: v.array(dashboardsFields.widget),
  isDefault: v.boolean(),
  isPublic: v.boolean(),

  // Classification for tags and custom metadata
  ...classificationFields,

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
