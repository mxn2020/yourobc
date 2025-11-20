// convex/schema/software/yourobc/trackingMessages/validators.ts
/**
 * Tracking Messages Validators
 *
 * Defines Convex validators for tracking message templates.
 * These validators ensure data integrity for message templates used in
 * shipment notifications across different statuses, languages, and service types.
 *
 * @module convex/schema/software/yourobc/trackingMessages/validators
 */

import { v } from 'convex/values'

// ============================================================================
// Message Status Validators
// ============================================================================

/**
 * Message template status validator
 * Tracks whether a message template is active or inactive
 */
export const messageTemplateStatusValidator = v.union(
  v.literal('active'),
  v.literal('inactive'),
  v.literal('draft'),
  v.literal('archived')
)

/**
 * Template variable validator
 * Validates individual template variables like {customerName}, {trackingNumber}, etc.
 */
export const templateVariableValidator = v.string()

/**
 * Template variables array validator
 * List of all variables used in the template
 */
export const templateVariablesValidator = v.array(templateVariableValidator)

// ============================================================================
// Export Validators
// ============================================================================

export const trackingMessagesValidators = {
  messageTemplateStatus: messageTemplateStatusValidator,
  templateVariable: templateVariableValidator,
  templateVariables: templateVariablesValidator,
} as const
