// convex/schema/yourobc/couriers/commissions.ts
// Table definition for courier commissions

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { couriersValidators } from './validators';
import { baseValidators } from '@/schema/base.validators';

// ============================================================================
// Commissions Table
// ============================================================================

/**
 * Commissions table
 * Tracks courier payments for shipments based on performance
 */
export const commissionsTable = defineTable({
  // Required: Public ID for external APIs and shareable URLs
  publicId: v.string(),

  // Required: Main display field (date-based for commissions)
  displayDate: v.number(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // Commission Target
  courierId: v.id('yourobcCouriers'),
  shipmentId: v.id('yourobcShipments'),

  // Commission Type & Calculation
  type: couriersValidators.commissionType,
  rate: v.number(), // Percentage (e.g., 15 for 15%) or fixed amount
  baseAmount: v.number(), // Amount commission is calculated from (e.g., shipment revenue)
  commissionAmount: v.number(), // Final calculated commission amount

  // Currency support
  currency: v.optional(baseValidators.currency),

  // Payment Status & Tracking
  status: couriersValidators.commissionSimpleStatus,
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()), // Bank transfer reference, check number, etc.
  paymentMethod: v.optional(baseValidators.paymentMethod),

  // Approval
  approvedBy: v.optional(v.string()), // authUserId of approver
  approvedDate: v.optional(v.number()),
  notes: v.optional(v.string()),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_display_date', ['displayDate'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_courier', ['courierId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_status', ['status'])
  .index('by_paidDate', ['paidDate'])
  .index('by_courier_status', ['courierId', 'status']) // For courier commission dashboard
  .index('by_created', ['createdAt']);
