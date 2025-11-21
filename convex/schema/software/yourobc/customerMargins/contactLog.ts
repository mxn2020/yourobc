// convex/schema/software/yourobc/customerMargins/contactLog.ts
/**
 * Contact Log Table Schema
 *
 * Tracks all customer interactions and communications.
 * Supports:
 * - Multiple contact types (email, phone, meeting, etc.)
 * - Bidirectional tracking (inbound/outbound)
 * - Follow-up workflow management
 * - Outcome tracking and categorization
 * - Cross-entity linking (quotes, shipments, invoices)
 * - Time tracking for contact duration
 *
 * @module convex/schema/software/yourobc/customerMargins/contactLog
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  contactTypeValidator,
  contactDirectionValidator,
  contactOutcomeValidator,
  contactCategoryValidator,
  contactPriorityValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
  publicIdField,
  ownerIdField,
} from '../../base'

/**
 * Contact Log Table
 *
 * Comprehensive tracking of all customer interactions.
 * Enables relationship management, follow-up workflows, and activity analysis.
 * Links contacts to related business entities for context.
 */
export const contactLogTable = defineTable({
  // Identity & Ownership
  ...publicIdField,
  ...ownerIdField,

  // Customer & Contact Person
  customerId: v.id('yourobcCustomers'),
  contactPersonId: v.optional(v.id('contactPersons')),

  // Contact Method & Direction
  contactType: contactTypeValidator, // email, phone, meeting, etc.
  direction: contactDirectionValidator, // inbound, outbound

  // Content
  subject: v.string(),
  summary: v.string(),
  details: v.optional(v.string()),

  // Outcome
  outcome: v.optional(contactOutcomeValidator),
  outcomeNotes: v.optional(v.string()),

  // Related Entities
  // Links to related business records for context
  relatedQuoteId: v.optional(v.id('yourobcQuotes')),
  relatedShipmentId: v.optional(v.id('yourobcShipments')),
  relatedInvoiceId: v.optional(v.id('yourobcInvoices')),

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
  category: v.optional(contactCategoryValidator),
  priority: v.optional(contactPriorityValidator),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_customer_date', ['customerId', 'contactDate'])
  .index('by_followUp', ['requiresFollowUp', 'followUpDate'])
  .index('by_followUpAssigned', ['followUpAssignedTo', 'followUpCompleted'])
  .index('by_contactedBy', ['contactedBy'])
  .index('by_created', ['createdAt'])

/**
 * Table exports
 */
export default contactLogTable

/**
 * USAGE NOTES:
 *
 * Creating Contact Records:
 * - Set customerId and optionally contactPersonId
 * - Specify contactType (email, phone, meeting, etc.)
 * - Set direction (inbound = customer initiated, outbound = we initiated)
 * - Record contactDate (timestamp) and optional duration (minutes)
 * - Set contactedBy to authUserId of employee handling the contact
 *
 * Follow-up Workflow:
 * 1. Set requiresFollowUp = true if action needed
 * 2. Set followUpDate for when follow-up should occur
 * 3. Set followUpAssignedTo for task assignment
 * 4. Use by_followUpAssigned index to query pending tasks
 * 5. When completed:
 *    - Set followUpCompleted = true
 *    - Set followUpCompletedDate
 *    - Set followUpCompletedBy
 *    - Add followUpNotes documenting outcome
 *
 * Linking Related Entities:
 * - Set relatedQuoteId when discussing quotes
 * - Set relatedShipmentId when discussing shipments
 * - Set relatedInvoiceId when discussing payments
 * - Enables context when viewing contact history
 *
 * Outcome Tracking:
 * - Set outcome (successful, pending, escalated, etc.)
 * - Document in outcomeNotes for details
 * - Use for success rate analysis
 *
 * Querying Patterns:
 * - by_customer: All contacts for a customer
 * - by_customer_date: Chronological contact history
 * - by_followUp: Pending follow-ups by date
 * - by_followUpAssigned: Tasks for specific employee
 * - by_contactedBy: Activity by employee
 *
 * Analytics:
 * - Track contact frequency per customer
 * - Monitor follow-up completion rates
 * - Analyze outcome success rates
 * - Measure employee activity (by_contactedBy)
 * - Calculate time investment (duration totals)
 */
