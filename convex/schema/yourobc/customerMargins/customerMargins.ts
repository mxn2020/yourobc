// convex/schema/yourobc/customerMargins/customerMargins.ts
// Table definitions for customerMargins module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { customerMarginsValidators } from './validators';

export const customerMarginsTable = defineTable({
  // Required: Main display field
  name: v.string(), // e.g., "Premium Service Margin"

  // Alternative identifier
  marginId: v.string(), // Auto-generated unique identifier

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Margin details
  status: customerMarginsValidators.status,
  serviceType: customerMarginsValidators.serviceType,
  marginType: customerMarginsValidators.marginType,

  // Customer reference
  customerId: v.id('yourobcCustomers'),
  customerName: v.optional(v.string()),

  // Margin values
  baseMargin: v.number(), // Base margin percentage or amount
  appliedMargin: v.number(), // Actually applied margin (may differ from base)
  minimumMargin: v.optional(v.number()),
  maximumMargin: v.optional(v.number()),

  // Effective dates
  effectiveFrom: v.number(),
  effectiveTo: v.optional(v.number()),

  // Pricing rules
  pricingRules: v.optional(v.array(v.object({
    id: v.string(),
    condition: v.string(), // e.g., "weight > 100kg"
    marginAdjustment: v.number(),
    description: v.optional(v.string()),
  }))),

  // Volume tiers (for volume-based margins)
  volumeTiers: v.optional(v.array(v.object({
    id: v.string(),
    minVolume: v.number(),
    maxVolume: v.optional(v.number()),
    marginPercentage: v.number(),
    description: v.optional(v.string()),
  }))),

  // History tracking
  previousMargin: v.optional(v.number()),
  changeReason: v.optional(v.string()),
  changeHistory: v.optional(v.array(v.object({
    id: v.string(),
    timestamp: v.number(),
    changedBy: v.id('userProfiles'),
    oldMargin: v.number(),
    newMargin: v.number(),
    reason: v.string(),
  }))),

  // Approval workflow
  approvalStatus: v.optional(customerMarginsValidators.approvalStatus),
  approvedBy: v.optional(v.id('userProfiles')),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),
  rejectedBy: v.optional(v.id('userProfiles')),
  rejectedDate: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Additional info
  notes: v.optional(v.string()),
  isAutoApplied: v.optional(v.boolean()),
  requiresApproval: v.optional(v.boolean()),

  // Classification
  tags: v.optional(v.array(v.string())),
  category: v.optional(v.string()),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_margin_id', ['marginId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_customer', ['customerId'])
  .index('by_service_type', ['serviceType'])
  .index('by_approval_status', ['approvalStatus'])
  .index('by_effective_from', ['effectiveFrom'])
  .index('by_customer_and_status', ['customerId', 'status'])
  .index('by_customer_and_service', ['customerId', 'serviceType'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);
