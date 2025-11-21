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

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { currencyAmountSchema, auditFields, softDeleteFields } from '@/schema/base'
import { accountingValidators } from './validators'

/**
 * Incoming Invoice Tracking Table
 * Tracks expected invoices from suppliers (partners) and their lifecycle
 */
export const incomingInvoiceTrackingTable = defineTable({
  // Identity fields
  publicId: v.string(), // Unique public identifier (e.g., "IIT-2025-00001")
  ownerId: v.string(), // Organization owner

  // References
  shipmentId: v.id('yourobcShipments'),
  partnerId: v.id('yourobcPartners'), // Supplier/carrier

  // Expected invoice details
  expectedDate: v.number(), // When we expect to receive the invoice
  expectedAmount: v.optional(currencyAmountSchema),

  // Received status
  status: accountingValidators.incomingInvoiceStatus,

  // Received invoice details
  invoiceId: v.optional(v.id('yourobcInvoices')), // Link to actual invoice when received
  receivedDate: v.optional(v.number()),
  actualAmount: v.optional(currencyAmountSchema),

  // Approval workflow
  approvedBy: v.optional(v.string()),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Payment details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),

  // Missing invoice tracking
  daysMissing: v.optional(v.number()), // Auto-calculated
  remindersSent: v.number(), // Count of reminders sent to supplier
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
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_partner', ['partnerId'])
  .index('by_status', ['status'])
  .index('by_expectedDate', ['expectedDate'])
  .index('by_status_expectedDate', ['status', 'expectedDate'])
  .index('by_ownerId_status', ['ownerId', 'status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
