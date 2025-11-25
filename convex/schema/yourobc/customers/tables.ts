// convex/schema/yourobc/customers/tables.ts
// Combined table definitions for customers module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import {
  auditFields,
  classificationFields,
  softDeleteFields,
  userProfileIdSchema,
} from '@/schema/base';
import { baseFields, baseValidators } from '@/schema/base.validators';
import {
  customerMarginsFields,
  customerMarginsValidators,
  customersFields,
  customersValidators,
} from './validators';
import { quoteIdSchema } from '../quotes/schemas';
import { shipmentIdSchema } from '../shipments/schemas';
import { invoiceIdSchema } from '../invoices/schemas';

export const customersTable = defineTable({
  // Required: Main display field
  companyName: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'), // User who owns/manages this customer record

  // Denormalized search field (ONLY if a searchIndex exists)
  searchableText: v.string(),

  // Core Identity
  shortName: v.optional(v.string()),
  website: v.optional(v.string()),

  // Contact Information
  primaryContact: baseFields.contact,
  additionalContacts: v.array(baseFields.contact),

  // Address Information
  billingAddress: baseFields.address,
  shippingAddress: v.optional(baseFields.address),

  // Financial Settings
  defaultCurrency: baseValidators.currency,
  paymentTerms: v.number(),
  paymentMethod: baseValidators.paymentMethod,
  margin: v.number(),

  // Status & Classification
  status: customersValidators.status,
  inquirySourceId: v.optional(v.id('yourobcInquirySources')),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()),
  serviceSuspendedDate: v.optional(v.number()),
  serviceSuspendedReason: v.optional(v.string()),
  serviceReactivatedDate: v.optional(v.number()),

  // Statistics
  stats: customersFields.customerStats,

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Classification
  ...classificationFields,

  // Metadata and audit fields
  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Full-text search indexes
  .searchIndex('search_all', {
    searchField: 'searchableText',
    filterFields: ['ownerId', 'status', 'deletedAt'],
  })

  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_company_name', ['companyName'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_country', ['billingAddress.country'])
  .index('by_inquiry_source', ['inquirySourceId'])
  .index('by_created_at', ['createdAt']);

export const customerMarginsTable = defineTable({
  // Required: Main display field
  name: v.string(), // e.g., "Premium Service Margin"

  // Alternative identifier
  marginId: v.string(), // Auto-generated unique identifier

  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Margin details
  status: customerMarginsValidators.status,
  serviceType: customerMarginsValidators.serviceType,
  marginType: customerMarginsValidators.marginType,

  // Customer reference
  customerId: v.id('yourobcCustomers'),
  customerName: v.optional(v.string()),

  // Margin values
  baseMargin: v.number(), // Base margin percentage or amount
  appliedMargin: v.number(), // Actually applied margin (may differ from base)
  minimumMargin: v.optional(v.number()),
  maximumMargin: v.optional(v.number()),

  // Effective dates
  effectiveFrom: v.number(),
  effectiveTo: v.optional(v.number()),

  // Pricing rules
  pricingRules: v.optional(v.array(customerMarginsFields.pricingRule)),

  // Volume tiers (for volume-based margins)
  volumeTiers: v.optional(v.array(customerMarginsFields.volumeTier)),

  // History tracking
  previousMargin: v.optional(v.number()),
  changeReason: v.optional(v.string()),
  changeHistory: v.optional(v.array(customerMarginsFields.changeHistoryEntry)),

  // Approval workflow
  approvalStatus: v.optional(customerMarginsValidators.approvalStatus),
  approvedBy: v.optional(userProfileIdSchema),
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),
  rejectedBy: v.optional(userProfileIdSchema),
  rejectedDate: v.optional(v.number()),
  rejectionReason: v.optional(v.string()),

  // Additional info
  notes: v.optional(v.string()),
  isAutoApplied: v.optional(v.boolean()),
  requiresApproval: v.optional(v.boolean()),

  // Classification
  ...classificationFields,

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_margin_id', ['marginId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_status', ['status'])
  .index('by_customer', ['customerId'])
  .index('by_service_type', ['serviceType'])
  .index('by_approval_status', ['approvalStatus'])
  .index('by_effective_from', ['effectiveFrom'])
  .index('by_customer_and_status', ['customerId', 'status'])
  .index('by_customer_and_service', ['customerId', 'serviceType'])
  .index('by_owner_and_status', ['ownerId', 'status'])
  .index('by_created_at', ['createdAt']);

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

export const customerAnalyticsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Identity
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

  // Margin Breakdown by Service Type
  marginsByService: v.optional(v.array(customerMarginsFields.marginsByServiceEntry)),

  // Top Routes (most common routes for this customer)
  topRoutes: v.optional(v.array(customerMarginsFields.topRoute)),

  // Payment Behavior
  totalInvoiced: v.number(),
  totalPaid: v.number(),
  totalOutstanding: v.number(),
  averagePaymentDays: v.number(), // Average days to pay
  onTimePaymentRate: v.number(), // Percentage paid on time
  latePaymentCount: v.number(),
  overdueInvoiceCount: v.number(), // Currently past due

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

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer', ['customerId'])
  .index('by_customer_period', ['customerId', 'year', 'month'])
  .index('by_followUpAlert', ['needsFollowUpAlert'])
  .index('by_year_month', ['year', 'month'])
  .index('by_created_at', ['createdAt']);

export const customerDunningConfigTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Identity
  customerId: v.id('yourobcCustomers'),

  // Dunning Level 1 (First Reminder)
  level1DaysOverdue: v.number(), // Default: 7 days
  level1FeeEUR: v.number(), // Custom fee for this customer
  level1EmailTemplate: v.optional(v.string()),
  level1AutoSend: v.boolean(),

  // Dunning Level 2 (Escalation)
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
  preferredDunningMethod: v.optional(customerMarginsValidators.dunningMethod),

  // Service Suspension Tracking
  serviceSuspended: v.optional(v.boolean()), // Currently suspended?
  serviceSuspendedDate: v.optional(v.number()), // When suspended
  serviceSuspendedBy: v.optional(v.string()), // authUserId who suspended
  serviceReactivatedDate: v.optional(v.number()), // When reactivated
  serviceReactivatedBy: v.optional(v.string()), // authUserId who reactivated
  serviceSuspensionReason: v.optional(v.string()), // Reason for suspension

  // Modification Tracking
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Required: Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_customer', ['customerId'])
  .index('by_customer_active', ['customerId', 'isActive'])
  .index('by_suspendService', ['allowServiceWhenOverdue'])
  .index('by_created_at', ['createdAt']);
