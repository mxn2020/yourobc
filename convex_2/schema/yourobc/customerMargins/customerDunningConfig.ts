// convex/schema/yourobc/customerMargins/customerDunningConfig.ts
// Table definitions for customerDunningConfig module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';
import { customerMarginsValidators } from './validators';
import { customerIdSchema } from '../customers/schemas';

export const customerDunningConfigTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Identity
  customerId: customerIdSchema,

  // Dunning Level 1 (First Reminder)
  level1DaysOverdue: v.number(), // Default: 7 days
  level1FeeEUR: v.number(), // Custom fee for this customer
  level1EmailTemplate: v.optional(v.string()),
  level1AutoSend: v.boolean(),

  // Dunning Level 2 (Escalation)
  level2DaysOverdue: v.number(), // Default: 14 days
  level2FeeEUR: v.number(),
  level2EmailTemplate: v.optional(v.string()),
  level2AutoSend: v.boolean(),

  // Dunning Level 3 (Final Warning)
  level3DaysOverdue: v.number(), // Default: 21 days
  level3FeeEUR: v.number(),
  level3EmailTemplate: v.optional(v.string()),
  level3AutoSend: v.boolean(),
  level3SuspendService: v.boolean(), // Auto-suspend after level 3?

  // Service Suspension Settings
  allowServiceWhenOverdue: v.boolean(), // Can they create new orders when overdue?
  suspensionGracePeriodDays: v.optional(v.number()),
  autoReactivateOnPayment: v.boolean(),

  // Custom Settings
  skipDunningProcess: v.boolean(), // VIP customers might skip dunning
  customPaymentTermsDays: v.optional(v.number()), // Override default payment terms
  requirePrepayment: v.boolean(), // Force prepayment for risky customers

  // Contact Preferences
  dunningContactEmail: v.optional(v.string()), // Specific email for dunning
  dunningContactPhone: v.optional(v.string()),
  dunningContactName: v.optional(v.string()), // Name of dunning contact person
  preferredDunningMethod: v.optional(customerMarginsValidators.dunningMethod),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()), // Currently suspended?
  serviceSuspendedDate: v.optional(v.number()), // When suspended
  serviceSuspendedBy: v.optional(v.string()), // authUserId who suspended
  serviceReactivatedDate: v.optional(v.number()), // When reactivated
  serviceReactivatedBy: v.optional(v.string()), // authUserId who reactivated
  serviceSuspensionReason: v.optional(v.string()), // Reason for suspension

  // Modification Tracking
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer', ['customerId'])
  .index('by_customer_active', ['customerId', 'isActive'])
  .index('by_suspendService', ['allowServiceWhenOverdue'])
  .index('by_created_at', ['createdAt']);
