// convex/schema/yourobc/invoices/invoices.ts
// Table definitions for invoices module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  softDeleteFields,
} from '@/schema/base';
import { invoicesValidators, invoicesFields } from './validators';
import { baseValidators } from '@/schema/base.validators';

export const invoicesTable = defineTable({
  // Required: Main display field
  invoiceNumber: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.string(), // authUserId - user who owns/manages this invoice

  // Invoice identification
  externalInvoiceNumber: v.optional(v.string()),

  // Invoice Type & Classification
  type: invoicesValidators.type,

  // References
  shipmentId: v.optional(v.id('yourobcShipments')),
  customerId: v.optional(v.id('yourobcCustomers')),
  partnerId: v.optional(v.id('yourobcPartners')),

  // Timeline
  issueDate: v.number(),
  dueDate: v.number(),
  sentAt: v.optional(v.number()),

  // Invoice Content
  description: v.string(),
  lineItems: v.array(invoicesFields.lineItem),
  billingAddress: v.optional(invoicesFields.address),

  // Pricing
  subtotal: invoicesFields.currencyAmount,
  taxRate: v.optional(v.number()),
  taxAmount: v.optional(invoicesFields.currencyAmount),
  totalAmount: invoicesFields.currencyAmount,

  // Payment Terms
  paymentTerms: v.number(),
  purchaseOrderNumber: v.optional(v.string()),

  // Payment Tracking
  status: invoicesValidators.status,
  paymentMethod: v.optional(baseValidators.paymentMethod),
  paymentDate: v.optional(v.number()),
  paidDate: v.optional(v.number()), // Alias for paymentDate (used in some parts of code)
  paymentReference: v.optional(v.string()),
  paidAmount: v.optional(invoicesFields.currencyAmount),

  // Collection
  collectionAttempts: v.array(invoicesFields.collectionAttempt),

  // Dunning Process
  dunningLevel: v.optional(v.number()), // Escalation level (0-3: none, level1, level2, level3)
  dunningFee: v.optional(v.number()), // Accumulated dunning fees
  lastDunningDate: v.optional(v.number()), // Last dunning action timestamp

  // Notes
  notes: v.optional(v.string()),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_invoiceNumber', ['invoiceNumber'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Additional useful indexes
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_customer', ['customerId'])
  .index('by_partner', ['partnerId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_dueDate', ['dueDate'])
  .index('by_issueDate', ['issueDate'])
  .index('by_type_status', ['type', 'status'])
  .index('by_owner_status', ['ownerId', 'status'])
  .index('by_created', ['createdAt']);
