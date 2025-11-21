// convex/schema/yourobc/supporting/index.ts
/**
 * Supporting Module Barrel Exports
 *
 * Central export point for all supporting schemas, types, and validators.
 *
 * @module convex/schema/yourobc/supporting
 */

// Table schemas
export * from './schemas'

// Type definitions
export * from './types'

// Validators
export * from './validators'

// Individual table exports
export { exchangeRatesTable } from './exchangeRates'
export { inquirySourcesTable } from './inquirySources'
export { wikiEntriesTable } from './wikiEntries'
export { commentsTable } from './comments'
export { followupRemindersTable } from './followupReminders'
export { documentsTable } from './documents'
export { notificationsTable } from './notifications'
export { countersTable } from './counters'
