// convex/schema/software/yourobc/trackingMessages/types.ts
/**
 * Tracking Messages Schema Types
 *
 * TypeScript types derived from Convex validators for tracking messages.
 * These types ensure type safety when working with tracking message data.
 *
 * @module convex/schema/software/yourobc/trackingMessages/types
 */

import { Infer } from 'convex/values'
import {
  messageTemplateStatusValidator,
  templateVariableValidator,
  templateVariablesValidator,
} from './validators'

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Message template status type
 * - active: Template is currently in use
 * - inactive: Template is disabled
 * - draft: Template is being created/edited
 * - archived: Template is no longer in use but preserved
 */
export type MessageTemplateStatus = Infer<typeof messageTemplateStatusValidator>

/**
 * Template variable type
 * Individual variable placeholder used in message templates
 * e.g., 'customerName', 'trackingNumber', 'deliveryDate'
 */
export type TemplateVariable = Infer<typeof templateVariableValidator>

/**
 * Template variables type
 * Array of variable placeholders used in a message template
 */
export type TemplateVariables = Infer<typeof templateVariablesValidator>

// ============================================================================
// Export Types
// ============================================================================

export const trackingMessagesTypes = {
  MessageTemplateStatus: {} as MessageTemplateStatus,
  TemplateVariable: {} as TemplateVariable,
  TemplateVariables: {} as TemplateVariables,
} as const
