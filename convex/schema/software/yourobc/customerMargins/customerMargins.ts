// convex/schema/software/yourobc/customerMargins/customerMargins.ts
/**
 * Customer Margins Table Schema
 *
 * Manages customer-specific margin rules and pricing configurations.
 * Supports:
 * - Dual margin system (percentage AND minimum EUR - higher wins)
 * - Service-specific margins (standard, express, international, etc.)
 * - Route-specific margins (origin-destination pairs)
 * - Volume-based tier pricing
 * - Negotiated special rates with expiry tracking
 * - Review schedule management
 *
 * @module convex/schema/software/yourobc/customerMargins/customerMargins
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  marginCalculationMethodValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
  publicIdField,
  ownerIdField,
} from '../../base'
import {
  serviceMarginValidator,
  routeMarginValidator,
  volumeTierValidator,
} from './validators'

/**
 * Customer Margin Rules Table
 *
 * Stores customer-specific margin configurations with multiple pricing strategies.
 * The dual margin system ensures profitability: final margin is the HIGHER of:
 * - (cost × marginPercentage) OR
 * - minimumMarginEUR
 *
 * Supports hierarchical pricing:
 * 1. Route-specific margins (most specific)
 * 2. Service-specific margins
 * 3. Volume-tier margins
 * 4. Default margins (fallback)
 */
export const customerMarginsTable = defineTable({
  // Identity & Ownership
  ...publicIdField,
  ...ownerIdField,
  customerId: v.id('yourobcCustomers'),

  // Default Margin Settings (applies to all services if no specific rule)
  defaultMarginPercentage: v.number(), // e.g., 15 for 15%
  defaultMinimumMarginEUR: v.number(), // e.g., 50 EUR minimum

  // Service-Specific Margins
  // Override defaults for specific service types (standard, express, etc.)
  serviceMargins: v.optional(v.array(serviceMarginValidator)),

  // Route-Specific Margins
  // Override for specific origin-destination pairs (most specific pricing)
  routeMargins: v.optional(v.array(routeMarginValidator)),

  // Volume-Based Margin Tiers
  // Lower margins for high-volume customers
  volumeTiers: v.optional(v.array(volumeTierValidator)),

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
  lastModifiedBy: v.optional(v.string()), // authUserId who last modified

  // Notes
  notes: v.optional(v.string()),
  internalNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('customer_active', ['customerId', 'isActive'])
  .index('by_active', ['isActive'])
  .index('by_next_review', ['nextReviewDate'])
  .index('by_created', ['createdAt'])

/**
 * Table exports
 */
export default customerMarginsTable

/**
 * USAGE NOTES:
 *
 * Margin Calculation Priority:
 * 1. Check route-specific margins first (if origin/destination match)
 * 2. Check service-specific margins (if service type matches)
 * 3. Check volume tiers (based on customer's monthly volume)
 * 4. Fall back to default margins
 *
 * For each level, apply dual margin system:
 * - finalMargin = Math.max(cost × marginPercentage/100, minimumMarginEUR)
 *
 * Review Schedule:
 * - Set nextReviewDate when creating/updating margins
 * - Query by_next_review index to find margins needing review
 * - Update lastReviewDate when review is completed
 *
 * Negotiated Rates:
 * - Set hasNegotiatedRates = true for custom pricing
 * - Track expiry with negotiatedRatesValidUntil
 * - Document terms in negotiatedRatesNotes
 *
 * Active Status:
 * - Use customer_active index for efficient lookups
 * - Only active margins should be used for pricing calculations
 * - Keep inactive margins for historical reference
 */
