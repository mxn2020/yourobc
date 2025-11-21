// convex/schema/software/yourobc/customerMargins/index.ts
/**
 * Customer Margins Module - Main Export
 *
 * Barrel file for the customer margins module containing 4 related tables:
 * - Customer Margins: Margin rules and pricing configurations
 * - Contact Log: Customer interaction tracking
 * - Customer Analytics: Performance metrics and analytics
 * - Customer Dunning Config: Payment enforcement policies
 *
 * @module convex/schema/software/yourobc/customerMargins
 */

// Export all validators
export * from './validators'

// Export all table schemas
export * from './schemas'

// Export all types
export * from './types'

// Export individual tables
export { default as customerMarginsTable } from './customerMargins'
export { default as contactLogTable } from './contactLog'
export { default as customerAnalyticsTable } from './customerAnalytics'
export { default as customerDunningConfigTable } from './customerDunningConfig'

// Default export with all schemas
export { default } from './schemas'
