// convex/schema/software/yourobc/supporting/validators.ts
/**
 * Supporting Module Validators
 *
 * Re-exports all validators used by the supporting tables.
 * These validators are defined in base.ts and imported here for consistency.
 *
 * @module convex/schema/software/yourobc/supporting/validators
 */

export {
  currencyValidator,
  reminderStatusValidator,
  servicePriorityValidator,
  notificationPriorityValidator,
  inquirySourceTypeValidator,
  wikiEntryTypeValidator,
  wikiStatusValidator,
  commentTypeValidator,
  reminderTypeValidator,
  recurrenceFrequencyValidator,
  documentTypeValidator,
  documentStatusValidator,
  notificationTypeValidator,
  counterTypeValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
} from '../../../yourobc/base'
