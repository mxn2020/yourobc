// convex/schema/software/yourobc/customerMargins/validators.ts
/**
 * Customer Margins Module Validators
 *
 * Comprehensive validators for all 4 tables in the customer margins module:
 * - Customer Margins (margin rules and pricing)
 * - Contact Log (customer interactions)
 * - Customer Analytics (performance metrics)
 * - Customer Dunning Config (payment enforcement)
 *
 * @module convex/schema/software/yourobc/customerMargins/validators
 */

import { v } from 'convex/values'
import {
  marginServiceTypeValidator,
  marginCalculationMethodValidator,
  contactTypeValidator,
  contactDirectionValidator,
  contactOutcomeValidator,
  contactCategoryValidator,
  contactPriorityValidator,
  dunningMethodValidator,
} from '../../base'

// ============================================================================
// Customer Margins Validators
// ============================================================================

/**
 * Service-specific margin configuration
 * Defines margin rules for specific service types (standard, express, etc.)
 */
export const serviceMarginValidator = v.object({
  serviceType: marginServiceTypeValidator,
  marginPercentage: v.number(),
  minimumMarginEUR: v.number(),
  description: v.optional(v.string()),
})

/**
 * Route-specific margin configuration
 * Defines margin rules for specific origin-destination pairs
 */
export const routeMarginValidator = v.object({
  routeId: v.optional(v.string()),
  origin: v.string(),
  destination: v.string(),
  marginPercentage: v.number(),
  minimumMarginEUR: v.number(),
  description: v.optional(v.string()),
})

/**
 * Volume-based margin tier
 * Lower margins for high-volume customers
 */
export const volumeTierValidator = v.object({
  minShipmentsPerMonth: v.number(),
  maxShipmentsPerMonth: v.optional(v.number()),
  marginPercentage: v.number(),
  minimumMarginEUR: v.number(),
  description: v.optional(v.string()),
})

// ============================================================================
// Customer Analytics Validators
// ============================================================================

/**
 * Service-specific analytics
 * Revenue, margin, and count by service type
 */
export const serviceAnalyticsValidator = v.object({
  revenue: v.number(),
  margin: v.number(),
  count: v.number(),
})

/**
 * Margins breakdown by service type
 */
export const marginsByServiceValidator = v.object({
  standard: v.optional(serviceAnalyticsValidator),
  express: v.optional(serviceAnalyticsValidator),
  overnight: v.optional(serviceAnalyticsValidator),
  international: v.optional(serviceAnalyticsValidator),
  freight: v.optional(serviceAnalyticsValidator),
})

/**
 * Top route analytics
 * Most frequently used routes with performance metrics
 */
export const topRouteValidator = v.object({
  origin: v.string(),
  destination: v.string(),
  count: v.number(),
  totalRevenue: v.number(),
  averageMargin: v.number(),
})

// ============================================================================
// Shared Field Validators
// ============================================================================

/**
 * Customer Margins Base Fields
 * Core fields required for all margin configurations
 */
export const customerMarginsBaseValidator = v.object({
  customerId: v.id('yourobcCustomers'),
  defaultMarginPercentage: v.number(),
  defaultMinimumMarginEUR: v.number(),
  hasNegotiatedRates: v.boolean(),
  isActive: v.boolean(),
  effectiveDate: v.number(),
})

/**
 * Contact Log Base Fields
 * Core fields required for all contact records
 */
export const contactLogBaseValidator = v.object({
  customerId: v.id('yourobcCustomers'),
  contactType: contactTypeValidator,
  direction: contactDirectionValidator,
  subject: v.string(),
  summary: v.string(),
  requiresFollowUp: v.boolean(),
  contactedBy: v.string(),
  contactDate: v.number(),
})

/**
 * Customer Analytics Base Fields
 * Core fields required for all analytics records
 */
export const customerAnalyticsBaseValidator = v.object({
  customerId: v.id('yourobcCustomers'),
  year: v.number(),
  totalShipments: v.number(),
  totalRevenue: v.number(),
  totalCost: v.number(),
  totalMargin: v.number(),
  calculatedAt: v.number(),
})

/**
 * Customer Dunning Config Base Fields
 * Core fields required for all dunning configurations
 */
export const customerDunningConfigBaseValidator = v.object({
  customerId: v.id('yourobcCustomers'),
  level1DaysOverdue: v.number(),
  level1FeeEUR: v.number(),
  level1AutoSend: v.boolean(),
  level2DaysOverdue: v.number(),
  level2FeeEUR: v.number(),
  level2AutoSend: v.boolean(),
  level3DaysOverdue: v.number(),
  level3FeeEUR: v.number(),
  level3AutoSend: v.boolean(),
  isActive: v.boolean(),
})

// ============================================================================
// Export All Validators
// ============================================================================

export default {
  // Margin validators
  serviceMarginValidator,
  routeMarginValidator,
  volumeTierValidator,

  // Analytics validators
  serviceAnalyticsValidator,
  marginsByServiceValidator,
  topRouteValidator,

  // Base validators
  customerMarginsBaseValidator,
  contactLogBaseValidator,
  customerAnalyticsBaseValidator,
  customerDunningConfigBaseValidator,
}
