// convex/schema/boilerplate/payments/payments/payments.ts
// Table definitions for payments module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { paymentsValidators } from './validators';

/**
 * Subscriptions Table
 * Stores user subscription data synced from payment providers (e.g., Autumn, Stripe)
 */
export const subscriptionsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // Maps to userId from original schema

  // Required: Display field
  name: v.string(), // Maps to planName from original schema
  description: v.optional(v.string()),

  // User reference
  authUserId: v.string(), // Better Auth user ID (for sync)

  // Payment provider details
  autumnCustomerId: v.optional(v.string()),
  autumnSubscriptionId: v.optional(v.string()),

  // Plan details
  planId: v.string(),
  planType: paymentsValidators.planType,

  // Subscription status
  status: paymentsValidators.subscriptionStatus,

  // Dates
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  trialEndDate: v.optional(v.number()),
  currentPeriodEnd: v.optional(v.number()),

  // Feature access
  features: v.optional(v.array(v.string())),
  limits: paymentsValidators.limitsObject,

  // Usage tracking
  usage: paymentsValidators.usageObject,

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_autumn_customer_id', ['autumnCustomerId'])
  .index('by_autumn_subscription_id', ['autumnSubscriptionId'])
  .index('by_plan_id', ['planId'])
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status']);

/**
 * Usage Logs Table
 * Tracks feature usage for metered billing
 */
export const usageLogsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who created this usage log

  // Required: Display field
  name: v.string(), // Descriptive name for the usage event
  description: v.optional(v.string()),

  // User and subscription references
  authUserId: v.string(),
  subscriptionId: v.id('subscriptions'),

  // Usage details
  featureKey: v.string(),
  quantity: v.number(),
  unit: v.optional(v.string()),

  // Context
  context: v.optional(v.string()),

  // Tracking
  trackedToAutumn: v.optional(v.boolean()),
  autumnEventId: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_subscription_id', ['subscriptionId'])
  .index('by_feature_key', ['featureKey'])
  .index('by_tracked_to_autumn', ['trackedToAutumn'])
  .index('by_owner_and_feature', ['ownerId', 'featureKey']);

/**
 * Payment Events Table
 * Stores payment-related events for audit trail
 */
export const paymentEventsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.optional(v.id('userProfiles')), // User associated with event

  // Required: Display field
  name: v.string(), // Human-readable event name
  description: v.optional(v.string()),

  // User and subscription references
  authUserId: v.optional(v.string()),
  subscriptionId: v.optional(v.id('subscriptions')),

  // Event details
  eventType: paymentsValidators.eventType,
  eventData: v.optional(v.any()),
  source: paymentsValidators.eventSource,

  // Status
  status: v.union(
    v.literal('pending'),
    v.literal('processed'),
    v.literal('failed')
  ),
  processed: v.optional(v.boolean()),
  error: v.optional(v.string()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])

  // Module-specific indexes
  .index('by_auth_user_id', ['authUserId'])
  .index('by_subscription_id', ['subscriptionId'])
  .index('by_event_type', ['eventType'])
  .index('by_status', ['status'])
  .index('by_processed', ['processed']);
