// convex/lib/software/yourobc/customerMargins/index.ts
/**
 * Customer Margins Library - Main Export
 *
 * Comprehensive library for managing customer margins module with 4 related tables:
 * - Customer Margins: Margin rules and pricing
 * - Contact Log: Customer interaction tracking
 * - Customer Analytics: Performance metrics
 * - Customer Dunning Config: Payment enforcement
 *
 * @module convex/lib/software/yourobc/customerMargins
 */

// Export all constants
export * from './constants'

// Export all types
export * from './types'

// Export all utilities
export * from './utils'

// Export all permissions
export * from './permissions'

// Export all queries
export * as queries from './queries'

// Export all mutations
export * as mutations from './mutations'

// Default export with everything
export { default as constants } from './constants'
export { default as utils } from './utils'
export { default as permissions } from './permissions'
export { default as queries } from './queries'
export { default as mutations } from './mutations'
