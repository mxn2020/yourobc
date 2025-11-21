// convex/schema/yourobc/customerMargins/customerAnalytics.ts
// Table definitions for customerAnalytics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, userProfileIdSchema } from '@/schema/base';
import { customerMarginsFields } from './validators';
import { customerIdSchema } from '../customers/schemas';

export const customerAnalyticsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: userProfileIdSchema,

  // Identity
  customerId: customerIdSchema,
  
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
