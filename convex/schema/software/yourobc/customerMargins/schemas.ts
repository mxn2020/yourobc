// convex/schema/software/yourobc/customerMargins/schemas.ts
/**
 * Customer Margins Module Schema Exports
 *
 * Consolidated exports for all 4 table schemas:
 * - customerMarginsTable: Margin rules and pricing
 * - contactLogTable: Customer interactions
 * - customerAnalyticsTable: Performance metrics
 * - customerDunningConfigTable: Payment enforcement
 *
 * @module convex/schema/software/yourobc/customerMargins/schemas
 */

import { customerMarginsTable } from './customerMargins'
import { contactLogTable } from './contactLog'
import { customerAnalyticsTable } from './customerAnalytics'
import { customerDunningConfigTable } from './customerDunningConfig'

/**
 * All customer margins module schemas
 */
export const customerMarginsSchemas = {
  customerMarginsTable,
  contactLogTable,
  customerAnalyticsTable,
  customerDunningConfigTable,
}

/**
 * Individual table exports
 */
export {
  customerMarginsTable,
  contactLogTable,
  customerAnalyticsTable,
  customerDunningConfigTable,
}

/**
 * Default export
 */
export default customerMarginsSchemas
