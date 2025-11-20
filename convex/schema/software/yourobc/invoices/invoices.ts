// convex/schema/software/yourobc/invoices/invoices.ts
// Table definitions for invoices module

import { defineTable } from 'convex/server';
import { auditFields, softDeleteFields } from '@/schema/base';
import { invoicesValidators } from './validators';

/**
 * Invoices Table
 *
 * Manages customer and partner invoices with payment tracking and collection details.
 * Supports both incoming and outgoing invoices with full audit trail.
 *
 * Features:
 * - Invoice generation and tracking
 * - Payment status and history
 * - Dunning process management
 * - Collection attempt tracking
 * - Multi-currency support
 * - Soft delete support
 *
 * Display Field: invoiceNumber
 */
export const invoicesTable = defineTable({
  // Identification
  publicId: invoicesValidators.publicId,
  invoiceNumber: invoicesValidators.invoiceNumber,
  externalInvoiceNumber: invoicesValidators.externalInvoiceNumber,

  // Invoice Type & Classification
  type: invoicesValidators.type,

  // Ownership
  ownerId: invoicesValidators.ownerId,

  // References
  shipmentId: invoicesValidators.shipmentId,
  customerId: invoicesValidators.customerId,
  partnerId: invoicesValidators.partnerId,

  // Timeline
  issueDate: invoicesValidators.issueDate,
  dueDate: invoicesValidators.dueDate,
  sentAt: invoicesValidators.sentAt,

  // Invoice Content
  description: invoicesValidators.description,
  lineItems: invoicesValidators.lineItems,
  billingAddress: invoicesValidators.billingAddress,

  // Pricing
  subtotal: invoicesValidators.subtotal,
  taxRate: invoicesValidators.taxRate,
  taxAmount: invoicesValidators.taxAmount,
  totalAmount: invoicesValidators.totalAmount,

  // Payment Terms
  paymentTerms: invoicesValidators.paymentTerms,
  purchaseOrderNumber: invoicesValidators.purchaseOrderNumber,

  // Payment Tracking
  status: invoicesValidators.status,
  paymentMethod: invoicesValidators.paymentMethod,
  paymentDate: invoicesValidators.paymentDate,
  paidDate: invoicesValidators.paidDate,
  paymentReference: invoicesValidators.paymentReference,
  paidAmount: invoicesValidators.paidAmount,

  // Collection
  collectionAttempts: invoicesValidators.collectionAttempts,

  // Dunning Process
  dunningLevel: invoicesValidators.dunningLevel,
  dunningFee: invoicesValidators.dunningFee,
  lastDunningDate: invoicesValidators.lastDunningDate,

  // Notes
  notes: invoicesValidators.notes,

  // Standard metadata and audit fields
  metadata: invoicesValidators.metadata,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_owner', ['ownerId'])

  // Display field index
  .index('by_invoice_number', ['invoiceNumber'])

  // Module-specific indexes
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_customer', ['customerId'])
  .index('by_partner', ['partnerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_due_date', ['dueDate'])
  .index('by_issue_date', ['issueDate'])
  .index('by_type_status', ['type', 'status'])
  .index('by_created_at', ['createdAt'])
  .index('by_updated_at', ['updatedAt'])

  // Custom business logic indexes
  .index('by_owner_type', ['ownerId', 'type'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_overdue', ['dueDate', 'status']);
