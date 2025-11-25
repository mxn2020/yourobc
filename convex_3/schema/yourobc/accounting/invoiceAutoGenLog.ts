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

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { accountingValidators } from './validators';

/**
 * Invoice Auto-Generation Log Table
 * Tracks automatic invoice generation after POD with notification status
 */
export const invoiceAutoGenLogTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

  // References
  shipmentId: v.id('yourobcShipments'),
  invoiceId: v.id('yourobcInvoices'),

  // Generation details
  generatedDate: v.number(),
  podReceivedDate: v.number(),
  invoiceNumber: v.string(),

  // Notification tracking
  notificationSent: v.boolean(),
  notificationSentDate: v.optional(v.number()),
  notificationRecipients: v.array(v.string()),

  // Status
  status: accountingValidators.invoiceAutoGenStatus,

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_generated_date', ['generatedDate'])
  .index('by_status', ['status'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);
