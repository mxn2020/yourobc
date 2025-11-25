// convex/schema/yourobc/customers/contactLog.ts
// Table definitions for contactLog module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';
import { customerMarginsValidators } from './validators';
import { quoteIdSchema } from '../quotes/schemas';
import { shipmentIdSchema } from '../shipments/schemas';
import { invoiceIdSchema } from '../invoices/schemas';

export const contactLogTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Customer & Contact Person
  customerId: v.id('yourobcCustomers'),
  contactPersonId: v.optional(v.id('contactPersons')),

  // Contact Method & Direction
  contactType: customerMarginsValidators.contactType, // email, phone, meeting, etc.
  direction: customerMarginsValidators.contactDirection, // inbound, outbound

  // Content
  subject: v.string(),
  summary: v.string(),
  details: v.optional(v.string()),

  // Outcome
  outcome: v.optional(customerMarginsValidators.contactOutcome),
  outcomeNotes: v.optional(v.string()),

  // Related Entities
  // Links to related business records for context
  relatedQuoteId: v.optional(quoteIdSchema),
  relatedShipmentId: v.optional(shipmentIdSchema),
  relatedInvoiceId: v.optional(invoiceIdSchema),

  // Follow-up Workflow
  requiresFollowUp: v.boolean(),
  followUpDate: v.optional(v.number()),
  followUpAssignedTo: v.optional(v.string()), // authUserId
  followUpCompleted: v.optional(v.boolean()),
  followUpCompletedDate: v.optional(v.number()),
  followUpCompletedBy: v.optional(v.string()), // authUserId
  followUpNotes: v.optional(v.string()),

  // Contact Record
  contactedBy: v.string(), // authUserId of employee
  contactDate: v.number(),
  duration: v.optional(v.number()), // in minutes

  // Classification
  category: v.optional(customerMarginsValidators.contactCategory),
  priority: v.optional(customerMarginsValidators.contactPriority),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  .index('by_customer', ['customerId'])
  .index('by_customer_date', ['customerId', 'contactDate'])
  .index('by_followUp', ['requiresFollowUp', 'followUpDate'])
  .index('by_followUpAssigned', ['followUpAssignedTo', 'followUpCompleted'])
  .index('by_contactedBy', ['contactedBy'])
  .index('by_created_at', ['createdAt']);
