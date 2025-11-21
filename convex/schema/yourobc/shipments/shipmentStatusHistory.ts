// convex/schema/yourobc/shipments/shipmentStatusHistory.ts
// Table definition for shipment status history sub-table

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  shipmentStatusValidator,
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
} from './validators';

// ============================================================================
// Shipment Status History Table
// ============================================================================

/**
 * Shipment status history table
 * Tracks all status changes and events during shipment lifecycle
 * This is a sub-table of shipments
 */
export const shipmentStatusHistoryTable = defineTable({
  // Required: Public ID for external APIs
  publicId: v.string(),

  // Required: Main display field (timestamp)
  timestamp: v.number(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),
  shipmentId: v.id('yourobcShipments'),
  status: shipmentStatusValidator,

  // Event details
  location: v.optional(v.string()),
  notes: v.optional(v.string()),

  // Event-specific metadata
  metadata: v.optional(v.object({
    flightNumber: v.optional(v.string()),
    estimatedArrival: v.optional(v.number()),
    delayReason: v.optional(v.string()),
    podReceived: v.optional(v.boolean()),
    customerSignature: v.optional(v.string()),
    courierAssigned: v.optional(v.id('yourobcCouriers')),
    courierNumber: v.optional(v.string()),
    oldDeadline: v.optional(v.number()),
    newDeadline: v.optional(v.number()),
    reason: v.optional(v.string()),
    actualCosts: v.optional(currencyAmountSchema),
    costNotes: v.optional(v.string()),
    cancellationReason: v.optional(v.string()),
  })),

  // Standard audit fields (history entries are mostly immutable)
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_shipment', ['shipmentId'])
  .index('by_timestamp', ['timestamp'])
  .index('by_shipment_timestamp', ['shipmentId', 'timestamp']);
