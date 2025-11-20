// convex/lib/software/yourobc/trackingMessages/utils.ts
/**
 * Tracking Messages Utilities
 *
 * Utility functions for tracking message operations including:
 * - Public ID generation
 * - Template variable extraction and rendering
 * - Validation helpers
 * - Display field formatting
 *
 * @module convex/lib/software/yourobc/trackingMessages/utils
 */

import {
  TRACKING_MESSAGE_PUBLIC_ID_PREFIX,
  TRACKING_MESSAGE_DISPLAY_FIELD,
  TRACKING_MESSAGE_FALLBACK_DISPLAY_FIELD,
  TEMPLATE_VARIABLE_PATTERN,
  TRACKING_MESSAGE_LIMITS,
} from './constants'
import type {
  TrackingMessage,
  TemplateVariableData,
  RenderedTemplate,
} from './types'

// ============================================================================
// Public ID Generation
// ============================================================================

/**
 * Generates a unique public ID for a tracking message
 * Format: tmsg_[timestamp]_[random]
 *
 * @returns {string} Generated public ID
 *
 * @example
 * const publicId = generateTrackingMessagePublicId()
 * // Returns: "tmsg_1234567890_abc123"
 */
export function generateTrackingMessagePublicId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `${TRACKING_MESSAGE_PUBLIC_ID_PREFIX}${timestamp}_${random}`
}

// ============================================================================
// Display Field Helpers
// ============================================================================

/**
 * Gets the display value for a tracking message
 * Uses subject as primary, falls back to template preview
 *
 * @param {TrackingMessage} message - The tracking message document
 * @returns {string} Display value
 *
 * @example
 * const displayValue = getTrackingMessageDisplayValue(message)
 * // Returns: "Booking Confirmation" or template preview
 */
export function getTrackingMessageDisplayValue(message: TrackingMessage): string {
  if (message.subject && message.subject.trim().length > 0) {
    return message.subject
  }

  // Fallback to template preview (first 50 characters)
  if (message.template && message.template.trim().length > 0) {
    const preview = message.template.substring(0, 50)
    return preview.length < message.template.length ? `${preview}...` : preview
  }

  return message.name || 'Untitled Message'
}

// ============================================================================
// Template Variable Extraction
// ============================================================================

/**
 * Extracts all variable placeholders from a template string
 * Finds all {variableName} patterns in the template
 *
 * @param {string} template - The template string
 * @returns {string[]} Array of variable names
 *
 * @example
 * const variables = extractTemplateVariables("Hello {customerName}, your order {orderId} is ready")
 * // Returns: ["customerName", "orderId"]
 */
export function extractTemplateVariables(template: string): string[] {
  const variables: string[] = []
  const matches = template.matchAll(TEMPLATE_VARIABLE_PATTERN)

  for (const match of matches) {
    const variableName = match[1]
    if (!variables.includes(variableName)) {
      variables.push(variableName)
    }
  }

  return variables
}

/**
 * Validates that all required variables are present in the data
 *
 * @param {string[]} requiredVariables - Required variable names
 * @param {TemplateVariableData} data - Variable data
 * @returns {string[]} Array of missing variable names
 *
 * @example
 * const missing = validateTemplateVariables(["customerName", "orderId"], { customerName: "John" })
 * // Returns: ["orderId"]
 */
export function validateTemplateVariables(
  requiredVariables: string[],
  data: TemplateVariableData
): string[] {
  return requiredVariables.filter(
    (variable) => data[variable] === undefined || data[variable] === null
  )
}

// ============================================================================
// Template Rendering
// ============================================================================

/**
 * Renders a template by replacing variables with actual values
 * Replaces {variableName} with corresponding data values
 *
 * @param {string} template - The template string
 * @param {TemplateVariableData} data - Variable data for substitution
 * @returns {string} Rendered template
 *
 * @example
 * const rendered = renderTemplate(
 *   "Hello {customerName}, your order {orderId} is ready",
 *   { customerName: "John", orderId: "12345" }
 * )
 * // Returns: "Hello John, your order 12345 is ready"
 */
export function renderTemplate(
  template: string,
  data: TemplateVariableData
): string {
  return template.replace(TEMPLATE_VARIABLE_PATTERN, (match, variableName) => {
    const value = data[variableName]
    return value !== undefined && value !== null ? String(value) : match
  })
}

/**
 * Renders a complete tracking message including subject and body
 * Returns rendered content and list of missing variables
 *
 * @param {TrackingMessage} message - The tracking message to render
 * @param {TemplateVariableData} data - Variable data for substitution
 * @returns {RenderedTemplate} Rendered template with subject, body, and missing variables
 *
 * @example
 * const result = renderTrackingMessage(message, { customerName: "John" })
 * // Returns: { subject: "...", body: "...", missingVariables: ["orderId"] }
 */
export function renderTrackingMessage(
  message: TrackingMessage,
  data: TemplateVariableData
): RenderedTemplate {
  const missingVariables = validateTemplateVariables(message.variables || [], data)

  return {
    subject: message.subject ? renderTemplate(message.subject, data) : undefined,
    body: renderTemplate(message.template, data),
    missingVariables,
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates tracking message name length
 *
 * @param {string} name - The name to validate
 * @returns {boolean} True if valid
 */
export function isValidTrackingMessageName(name: string): boolean {
  return (
    name.trim().length > 0 && name.length <= TRACKING_MESSAGE_LIMITS.name
  )
}

/**
 * Validates tracking message description length
 *
 * @param {string | undefined} description - The description to validate
 * @returns {boolean} True if valid
 */
export function isValidTrackingMessageDescription(
  description: string | undefined
): boolean {
  if (!description) return true
  return description.length <= TRACKING_MESSAGE_LIMITS.description
}

/**
 * Validates tracking message subject length
 *
 * @param {string | undefined} subject - The subject to validate
 * @returns {boolean} True if valid
 */
export function isValidTrackingMessageSubject(
  subject: string | undefined
): boolean {
  if (!subject) return true
  return subject.length <= TRACKING_MESSAGE_LIMITS.subject
}

/**
 * Validates tracking message template length
 *
 * @param {string} template - The template to validate
 * @returns {boolean} True if valid
 */
export function isValidTrackingMessageTemplate(template: string): boolean {
  return (
    template.trim().length > 0 && template.length <= TRACKING_MESSAGE_LIMITS.template
  )
}

/**
 * Validates all tracking message fields
 *
 * @param {Object} data - The data to validate
 * @returns {Object} Validation result with errors
 */
export function validateTrackingMessageData(data: {
  name: string
  description?: string
  subject?: string
  template: string
}): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!isValidTrackingMessageName(data.name)) {
    errors.push(
      `Name must be between 1 and ${TRACKING_MESSAGE_LIMITS.name} characters`
    )
  }

  if (!isValidTrackingMessageDescription(data.description)) {
    errors.push(
      `Description must be at most ${TRACKING_MESSAGE_LIMITS.description} characters`
    )
  }

  if (!isValidTrackingMessageSubject(data.subject)) {
    errors.push(
      `Subject must be at most ${TRACKING_MESSAGE_LIMITS.subject} characters`
    )
  }

  if (!isValidTrackingMessageTemplate(data.template)) {
    errors.push(
      `Template must be between 1 and ${TRACKING_MESSAGE_LIMITS.template} characters`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

// ============================================================================
// Template Analysis
// ============================================================================

/**
 * Analyzes a template and extracts metadata
 *
 * @param {string} template - The template to analyze
 * @returns {Object} Template metadata
 */
export function analyzeTemplate(template: string): {
  variableCount: number
  variables: string[]
  characterCount: number
  estimatedLength: number
} {
  const variables = extractTemplateVariables(template)

  return {
    variableCount: variables.length,
    variables,
    characterCount: template.length,
    estimatedLength: template.length, // Could be enhanced with average variable lengths
  }
}

// ============================================================================
// Formatting Helpers
// ============================================================================

/**
 * Formats a tracking message for display in lists
 *
 * @param {TrackingMessage} message - The tracking message
 * @returns {Object} Formatted message data
 */
export function formatTrackingMessageForDisplay(message: TrackingMessage): {
  id: string
  publicId: string
  displayValue: string
  serviceType: string
  status: string
  language: string
  isActive: boolean
} {
  return {
    id: message._id,
    publicId: message.publicId,
    displayValue: getTrackingMessageDisplayValue(message),
    serviceType: message.serviceType,
    status: message.status,
    language: message.language,
    isActive: message.isActive,
  }
}
