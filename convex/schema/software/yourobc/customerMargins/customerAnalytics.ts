// convex/schema/software/yourobc/customerMargins/customerAnalytics.ts
/**
 * Customer Analytics Table Schema
 *
 * Stores aggregated customer performance metrics and analytics.
 * Supports:
 * - Period-based analytics (yearly/monthly)
 * - Shipment and financial statistics
 * - Margin breakdown by service type
 * - Top routes analysis
 * - Payment behavior metrics
 * - Dunning statistics
 * - Contact activity tracking
 * - Quality metrics and satisfaction scores
 *
 * @module convex/schema/software/yourobc/customerMargins/customerAnalytics
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  auditFields,
  softDeleteFields,
  metadataSchema,
  publicIdField,
  ownerIdField,
} from '../../base'
import {
  marginsByServiceValidator,
  topRouteValidator,
} from './validators'

/**
 * Customer Analytics Table
 *
 * Cached/aggregated customer performance data for efficient reporting and analysis.
 * Updated periodically (monthly/yearly) to track trends and identify opportunities.
 * Enables fast dashboards without complex aggregation queries.
 */
export const customerAnalyticsTable = defineTable({
  // Identity & Ownership
  ...publicIdField,
  ...ownerIdField,
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
  marginsByService: v.optional(marginsByServiceValidator),

  // Top Routes (most common routes for this customer)
  topRoutes: v.optional(v.array(topRouteValidator)),

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

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_customer_period', ['customerId', 'year', 'month'])
  .index('by_followUpAlert', ['needsFollowUpAlert'])
  .index('by_year_month', ['year', 'month'])
  .index('by_created', ['createdAt'])

/**
 * Table exports
 */
export default customerAnalyticsTable

/**
 * USAGE NOTES:
 *
 * Analytics Generation:
 * - Run periodic jobs to calculate analytics (monthly/yearly)
 * - Set year and optionally month for the period
 * - Aggregate data from shipments, invoices, contacts, etc.
 * - Store calculatedAt timestamp for cache freshness
 *
 * Shipment Metrics:
 * - totalShipments: All shipments in period
 * - completedShipments: Successfully delivered
 * - cancelledShipments: Cancelled before completion
 * - Completion rate = completedShipments / totalShipments
 *
 * Financial Metrics:
 * - totalRevenue: Total billed to customer
 * - totalCost: Total carrier/supplier costs
 * - totalMargin: Revenue - Cost
 * - averageMargin: Average per shipment
 * - averageMarginPercentage: (margin / revenue) × 100
 *
 * Service Breakdown:
 * - marginsByService: Performance by service type
 * - Each service type includes: revenue, margin, count
 * - Use to identify most profitable service types
 *
 * Route Analysis:
 * - topRoutes: Most frequently used routes
 * - Includes count, revenue, average margin per route
 * - Use to optimize route-specific pricing
 *
 * Payment Behavior:
 * - averagePaymentDays: Typical time to pay invoices
 * - onTimePaymentRate: Percentage paid by due date
 * - totalOutstanding: Currently unpaid amount
 * - overdueInvoiceCount: Invoices past due date
 * - Use to assess credit risk
 *
 * Dunning Metrics:
 * - dunningLevel1/2/3Count: Escalation frequency
 * - totalDunningFees: Fees charged in period
 * - Use to identify payment problems early
 *
 * Contact Tracking:
 * - totalContacts: Number of interactions in period
 * - daysSinceLastContact: Calculated from lastContactDate
 * - needsFollowUpAlert: Flag if >35 days inactive
 * - Use by_followUpAlert index to find neglected customers
 *
 * Quality Metrics:
 * - complaintCount: Customer complaints in period
 * - issueResolutionRate: Successfully resolved issues
 * - customerSatisfactionScore: Survey results if available
 * - Use to monitor service quality
 *
 * Querying Patterns:
 * - by_customer: All analytics for a customer
 * - by_customer_period: Specific period analytics
 * - by_followUpAlert: Customers needing attention
 * - by_year_month: Cross-customer period comparison
 *
 * Cache Management:
 * - Check calculatedAt to determine if refresh needed
 * - Recalculate if data is stale (e.g., >1 day old)
 * - Update existing record or create new for new period
 */
