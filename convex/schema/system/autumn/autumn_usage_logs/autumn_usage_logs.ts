// convex/schema/boilerplate/autumn/autumn_usage_logs/autumn_usage_logs.ts
// Table definitions for autumn usage logs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { autumnUsageLogsValidators } from './validators';

export const autumnUsageLogsTable = defineTable({
  // Required: Main display field (constructed from feature and value)
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User reference
  userId: v.id('userProfiles'),
  authUserId: v.string(),
  autumnCustomerId: v.string(),

  // Usage details
  featureId: v.string(),
  value: v.number(),

  // Sync status
  syncedToAutumn: autumnUsageLogsValidators.syncedToAutumn,
  syncedAt: v.optional(v.number()),
  syncError: v.optional(v.string()),

  // Activity tracking
  lastActivityAt: v.number(),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_autumn_customer_id', ['autumnCustomerId'])
  .index('by_synced_to_autumn', ['syncedToAutumn'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity', ['lastActivityAt']);
