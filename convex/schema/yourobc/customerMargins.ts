// convex/schema/yourobc/customerMargins.ts
/**
 * YourOBC Customer Margins Schema
 *
 * Defines schemas for customer margin rules, contact logs, analytics, and dunning configuration.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/customerMargins
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  marginServiceTypeValidator,
  marginCalculationMethodValidator,
  contactTypeValidator,
  contactDirectionValidator,
  contactOutcomeValidator,
  contactCategoryValidator,
  contactPriorityValidator,
  servicePriorityValidator,
  dunningMethodValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from './base'

// ============================================================================
// Customer Margins Table
// ============================================================================

/**
 * Customer Margin Rules
 * Dual margin system: percentage AND minimum EUR amount (higher wins)
 * Service-specific margins for different service types
 */
export const customerMarginsTable = defineTable({
  customerId: v.id('yourobcCustomers'),

  // Default Margin Settings (applies to all services if no specific rule)
  defaultMarginPercentage: v.number(), // e.g., 15 for 15%
  defaultMinimumMarginEUR: v.number(), // e.g., 50 EUR minimum

  // Service-Specific Margins
  serviceMargins: v.optional(v.array(v.object({
    serviceType: marginServiceTypeValidator,
    marginPercentage: v.number(),
    minimumMarginEUR: v.number(),
    description: v.optional(v.string()),
  }))),

  // Route-Specific Margins (for specific origin-destination pairs)
  routeMargins: v.optional(v.array(v.object({
    routeId: v.optional(v.string()), // Reference to common route
    origin: v.string(), // City/ZIP
    destination: v.string(), // City/ZIP
    marginPercentage: v.number(),
    minimumMarginEUR: v.number(),
    description: v.optional(v.string()),
  }))),

  // Volume-Based Margin Tiers (higher volume = lower margin)
  volumeTiers: v.optional(v.array(v.object({
    minShipmentsPerMonth: v.number(),
    maxShipmentsPerMonth: v.optional(v.number()),
    marginPercentage: v.number(),
    minimumMarginEUR: v.number(),
    description: v.optional(v.string()),
  }))),

  // Negotiated Special Rates
  hasNegotiatedRates: v.boolean(),
  negotiatedRatesNotes: v.optional(v.string()),
  negotiatedRatesValidUntil: v.optional(v.number()),

  // Margin Calculation
  calculationMethod: v.optional(marginCalculationMethodValidator),
  customCalculationNotes: v.optional(v.string()),

  // Status & Dates
  isActive: v.boolean(),
  effectiveDate: v.number(),
  expiryDate: v.optional(v.number()),

  // Review Schedule
  lastReviewDate: v.optional(v.number()),
  nextReviewDate: v.optional(v.number()),

  // Modification Tracking
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified this margin config

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_customer', ['customerId'])
  .index('customer_active', ['customerId', 'isActive']) // Code expects without 'by_' prefix
  .index('by_active', ['isActive']) // New index for active margins
  .index('by_next_review', ['nextReviewDate']) // Renamed from by_nextReviewDate
  .index('by_created', ['createdAt'])

// ============================================================================
// Contact Log Table
// ============================================================================

/**
 * Contact Log - Tracks all customer interactions
 */
export const contactLogTable = defineTable({
  customerId: v.id('yourobcCustomers'),
  contactPersonId: v.optional(v.id('contactPersons')),

  // Contact Method & Direction
  contactType: contactTypeValidator,
  direction: contactDirectionValidator,

  // Content
  subject: v.string(),
  summary: v.string(),
  details: v.optional(v.string()),

  // Outcome
  outcome: v.optional(contactOutcomeValidator),
  outcomeNotes: v.optional(v.string()),

  // Related Entities
  relatedQuoteId: v.optional(v.id('yourobcQuotes')),
  relatedShipmentId: v.optional(v.id('yourobcShipments')),
  relatedInvoiceId: v.optional(v.id('yourobcInvoices')),

  
  // Follow-up
  requiresFollowUp: v.boolean(),
  followUpDate: v.optional(v.number()),
  followUpAssignedTo: v.optional(v.string()), // authUserId
  followUpCompleted: v.optional(v.boolean()),
  followUpCompletedDate: v.optional(v.number()),
  followUpCompletedBy: v.optional(v.string()), // authUserId who completed follow-up
  followUpNotes: v.optional(v.string()), // Notes for follow-up task

  // Contact Record
  contactedBy: v.string(), // authUserId of employee who made contact
  contactDate: v.number(),
  duration: v.optional(v.number()), // in minutes
  
  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,

  // Individual Classification
  category: v.optional(contactCategoryValidator),
  priority: v.optional(contactPriorityValidator),

})
  .index('by_customer', ['customerId'])
  .index('by_customer_date', ['customerId', 'contactDate'])
  .index('by_followUp', ['requiresFollowUp', 'followUpDate'])
  .index('by_followUpAssigned', ['followUpAssignedTo', 'followUpCompleted'])
  .index('by_contactedBy', ['contactedBy'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Customer Analytics Table
// ============================================================================

/**
 * Customer Analytics & History
 * Cached/aggregated data for performance
 */
export const customerAnalyticsTable = defineTable({
  customerId: v.id('yourobcCustomers'),

  // Time Period
  year: v.number(),
  month: v.optional(v.number()), // If monthly analytics

  // Shipment Statistics
  totalShipments: v.number(),
  completedShipments: v.number(),
  cancelledShipments: v.number(),

  // Financial Metrics
  totalRevenue: v.number(),
  totalCost: v.number(),
  totalMargin: v.number(),
  averageMargin: v.number(),
  averageMarginPercentage: v.number(),

  // Margin Breakdown
  marginsByService: v.optional(v.object({
    standard: v.optional(v.object({ revenue: v.number(), margin: v.number(), count: v.number() })),
    express: v.optional(v.object({ revenue: v.number(), margin: v.number(), count: v.number() })),
    overnight: v.optional(v.object({ revenue: v.number(), margin: v.number(), count: v.number() })),
    international: v.optional(v.object({ revenue: v.number(), margin: v.number(), count: v.number() })),
    freight: v.optional(v.object({ revenue: v.number(), margin: v.number(), count: v.number() })),
  })),

  // Standard Routes (most common routes for this customer)
  topRoutes: v.optional(v.array(v.object({
    origin: v.string(),
    destination: v.string(),
    count: v.number(),
    totalRevenue: v.number(),
    averageMargin: v.number(),
  }))),

  // Payment Behavior
  totalInvoiced: v.number(),
  totalPaid: v.number(),
  totalOutstanding: v.number(),
  averagePaymentDays: v.number(), // Average days to pay
  onTimePaymentRate: v.number(), // Percentage paid on time
  latePaymentCount: v.number(),
  overdueInvoiceCount: v.number(), // Count of invoices past due date and unpaid

  // Dunning Statistics
  dunningLevel1Count: v.number(),
  dunningLevel2Count: v.number(),
  dunningLevel3Count: v.number(),
  totalDunningFees: v.number(),

  // Contact Activity
  totalContacts: v.number(),
  lastContactDate: v.optional(v.number()),
  daysSinceLastContact: v.optional(v.number()),
  needsFollowUpAlert: v.boolean(), // True if >35 days since last contact

  // Quality Metrics
  complaintCount: v.number(),
  issueResolutionRate: v.number(), // Percentage of issues resolved
  customerSatisfactionScore: v.optional(v.number()), // If tracked

  // Calculated At
  calculatedAt: v.number(),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_customer', ['customerId'])
  .index('by_customer_period', ['customerId', 'year', 'month'])
  .index('by_followUpAlert', ['needsFollowUpAlert'])
  .index('by_year_month', ['year', 'month'])
  .index('by_created', ['createdAt'])

// ============================================================================
// Customer Dunning Configuration Table
// ============================================================================

/**
 * Payment Dunning Configuration
 * Customer-specific dunning settings and policies
 */
export const customerDunningConfigTable = defineTable({
  customerId: v.id('yourobcCustomers'),

  // Dunning Level 1
  level1DaysOverdue: v.number(), // Default: 7 days
  level1FeeEUR: v.number(), // Custom fee for this customer
  level1EmailTemplate: v.optional(v.string()),
  level1AutoSend: v.boolean(),

  // Dunning Level 2
  level2DaysOverdue: v.number(), // Default: 14 days
  level2FeeEUR: v.number(),
  level2EmailTemplate: v.optional(v.string()),
  level2AutoSend: v.boolean(),

  // Dunning Level 3 (Final Warning)
  level3DaysOverdue: v.number(), // Default: 21 days
  level3FeeEUR: v.number(),
  level3EmailTemplate: v.optional(v.string()),
  level3AutoSend: v.boolean(),
  level3SuspendService: v.boolean(), // Auto-suspend after level 3?

  // Service Suspension Settings
  allowServiceWhenOverdue: v.boolean(), // Can they create new orders when overdue?
  suspensionGracePeriodDays: v.optional(v.number()),
  autoReactivateOnPayment: v.boolean(),

  // Custom Settings
  skipDunningProcess: v.boolean(), // VIP customers might skip dunning
  customPaymentTermsDays: v.optional(v.number()), // Override default payment terms
  requirePrepayment: v.boolean(), // Force prepayment for risky customers

  // Contact Preferences
  dunningContactEmail: v.optional(v.string()), // Specific email for dunning
  dunningContactPhone: v.optional(v.string()),
  dunningContactName: v.optional(v.string()), // Name of dunning contact person
  preferredDunningMethod: v.optional(dunningMethodValidator),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()), // Whether service is currently suspended due to dunning
  serviceSuspendedDate: v.optional(v.number()), // When service was suspended
  serviceSuspendedBy: v.optional(v.string()), // authUserId who suspended service
  serviceReactivatedDate: v.optional(v.number()), // When service was reactivated after payment
  serviceReactivatedBy: v.optional(v.string()), // authUserId who reactivated service
  serviceSuspensionReason: v.optional(v.string()), // Reason for suspension

  // Modification Tracking
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified this config

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_customer', ['customerId'])
  .index('by_customer_active', ['customerId', 'isActive'])
  .index('by_suspendService', ['allowServiceWhenOverdue'])
  .index('by_created', ['createdAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (marginServiceTypeValidator, contactTypeValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, metadataSchema, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for audit/metadata fields: ...auditFields, ...softDeleteFields, ...metadataSchema
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit or metadata fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Customer Margins:
 *    - Dual margin system: percentage AND minimum EUR amount
 *    - Calculation: higher of (cost × percentage) or (minimum EUR) wins
 *    - Service-specific margins for different service types (standard, express, etc.)
 *    - Route-specific margins for origin-destination pairs
 *    - Volume-based tiers for high-volume customers
 *    - Negotiated rates with expiry dates
 *    - Review schedule tracking
 *
 * 2. Contact Log:
 *    - Tracks all customer interactions (calls, emails, meetings, etc.)
 *    - Links to related entities (quotes, shipments, invoices)
 *    - Follow-up workflow with assignment and completion tracking
 *    - Outcome tracking and categorization
 *    - Duration tracking for time management
 *
 * 3. Customer Analytics:
 *    - Period-based analytics (yearly/monthly)
 *    - Shipment and financial statistics
 *    - Margin breakdown by service type
 *    - Top routes analysis
 *    - Payment behavior metrics
 *    - Dunning statistics
 *    - Contact activity tracking
 *    - Quality metrics (complaints, resolution rate)
 *    - Follow-up alerts (>35 days since last contact)
 *
 * 4. Dunning Configuration:
 *    - Customer-specific payment dunning policies
 *    - Three-level dunning process with fees
 *    - Auto-send configuration per level
 *    - Service suspension settings
 *    - VIP customers can skip dunning
 *    - Custom payment terms
 *    - Prepayment requirements for risky customers
 *    - Preferred dunning contact and method
 *
 * 5. Indexes:
 *    - by_customer: Primary customer lookups
 *    - by_customer_active: Active margin rules
 *    - by_customer_period: Analytics period queries
 *    - by_followUp: Pending follow-up tasks
 *    - by_followUpAlert: Customers needing contact
 */

export default {
  customerMarginsTable,
  contactLogTable,
  customerAnalyticsTable,
  customerDunningConfigTable,
}
