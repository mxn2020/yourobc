// convex/schema/yourobc/accounting/incomingInvoiceTracking.ts
/**
 * Incoming Invoice Tracking Table
 *
 * Tracks expected invoices from suppliers and their status.
 * Monitors invoice receipt, approval workflow, payment tracking,
 * missing invoice alerts, and dispute management.
 *
 * @module convex/schema/yourobc/accounting/incomingInvoiceTracking
 */

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, currencyAmountSchema, softDeleteFields } from '@/schema/base';
import { accountingValidators } from './validators';

/**
 * Incoming Invoice Tracking Table
 * Tracks expected invoices from suppliers (partners) and their lifecycle
 */
export const incomingInvoiceTrackingTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // References
  shipmentId: v.id('yourobcShipments'),
  partnerId: v.id('yourobcPartners'),

  // Expected invoice details
  expectedDate: v.number(),
  expectedAmount: v.optional(currencyAmountSchema),

  // Received status
  status: accountingValidators.incomingInvoiceStatus,

  // Received invoice details
  invoiceId: v.optional(v.id('yourobcInvoices')),
  receivedDate: v.optional(v.number()),
  actualAmount: v.optional(currencyAmountSchema),

  // Approval workflow
  approvedBy: v.optional(v.id('userProfiles')),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Payment details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),

  // Missing invoice tracking
  daysMissing: v.optional(v.number()),
  remindersSent: v.number(),
  lastReminderDate: v.optional(v.number()),

  // Dispute tracking
  disputeReason: v.optional(v.string()),
  disputeDate: v.optional(v.number()),
  disputeResolvedDate: v.optional(v.number()),

  // Notes
  internalNotes: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_partner', ['partnerId'])
  .index('by_status', ['status'])
  .index('by_expected_date', ['expectedDate'])
  .index('by_status_expected_date', ['status', 'expectedDate'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);
