// convex/schema/software/yourobc/invoices/validators.ts
// Grouped validators for invoices module

import { v } from 'convex/values';

// Import shared validators from base schema
import {
  invoiceStatusValidator,
  invoiceTypeValidator,
  paymentMethodValidator,
  currencyAmountSchema,
  addressSchema,
  lineItemSchema,
  collectionAttemptSchema,
  collectionMethodValidator,
  metadataSchema,
} from '../../../../yourobc/base';

export const invoicesValidators = {
  // Identification fields
  publicId: v.string(),
  invoiceNumber: v.string(),
  externalInvoiceNumber: v.optional(v.string()),

  // Invoice Type & Classification
  type: invoiceTypeValidator,

  // Owner (for multi-tenant access control)
  ownerId: v.id('userProfiles'),

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
  lineItems: v.array(lineItemSchema),
  billingAddress: v.optional(addressSchema),

  // Pricing
  subtotal: currencyAmountSchema,
  taxRate: v.optional(v.number()),
  taxAmount: v.optional(currencyAmountSchema),
  totalAmount: currencyAmountSchema,

  // Payment Terms
  paymentTerms: v.number(),
  purchaseOrderNumber: v.optional(v.string()),

  // Payment Tracking
  status: invoiceStatusValidator,
  paymentMethod: v.optional(paymentMethodValidator),
  paymentDate: v.optional(v.number()),
  paidDate: v.optional(v.number()), // Alias for paymentDate
  paymentReference: v.optional(v.string()),
  paidAmount: v.optional(currencyAmountSchema),

  // Collection
  collectionAttempts: v.array(collectionAttemptSchema),

  // Dunning Process
  dunningLevel: v.optional(v.number()), // Escalation level (0-3)
  dunningFee: v.optional(v.number()),
  lastDunningDate: v.optional(v.number()),

  // Notes
  notes: v.optional(v.string()),

  // Standard metadata
  metadata: metadataSchema,
} as const;
