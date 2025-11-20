// convex/schema/boilerplate/autumn/autumn_customers/autumn_customers.ts
// Table definitions for autumn customers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { autumnCustomersValidators } from './validators';

export const autumnCustomersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // User references
  userId: v.id('userProfiles'),
  authUserId: v.string(),

  // Autumn customer ID
  autumnCustomerId: v.string(),

  // Cached subscription info (updated from Autumn)
  currentPlanId: v.optional(v.string()),
  subscriptionStatus: v.optional(autumnCustomersValidators.subscriptionStatus),

  // Cache timestamps
  lastSyncedAt: v.number(),

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
  .index('by_user_id', ['userId'])
  .index('by_auth_user_id', ['authUserId'])
  .index('by_autumn_customer_id', ['autumnCustomerId'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity', ['lastActivityAt']);
