// convex/schema/yourobc/accounting/invoiceAutoGenLog.ts
/**
 * Invoice Auto-Generation Log Table
 *
 * Tracks automatic invoice generation after POD upload.
 * Monitors invoice creation, notification delivery, and status tracking
 * for invoices generated automatically from proof of delivery.
 *
 * @module convex/schema/yourobc/accounting/invoiceAutoGenLog
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  invoiceAutoGenStatusValidator,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Invoice Auto-Generation Log Table
 * Tracks automatic invoice generation after POD with notification status
 */
export const invoiceAutoGenLogTable = defineTable({
  // Identity fields
  publicId: v.string(), // Unique public identifier (e.g., "IAGL-2025-00001")
  ownerId: v.string(), // Organization owner

  // References
  shipmentId: v.id('yourobcShipments'),
  invoiceId: v.id('yourobcInvoices'),

  // Generation details
  generatedDate: v.number(),
  podReceivedDate: v.number(), // When POD was uploaded
  invoiceNumber: v.string(),

  // Notification tracking
  notificationSent: v.boolean(),
  notificationSentDate: v.optional(v.number()),
  notificationRecipients: v.array(v.string()), // Email addresses

  // Status
  status: invoiceAutoGenStatusValidator,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_generatedDate', ['generatedDate'])
  .index('by_status', ['status'])
  .index('by_ownerId_status', ['ownerId', 'status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
