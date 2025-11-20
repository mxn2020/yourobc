// convex/lib/software/yourobc/trackingMessages/constants.ts
/**
 * Tracking Messages Constants
 *
 * Defines constants used throughout the tracking messages module.
 * Includes default values, configuration options, and common variables.
 *
 * @module convex/lib/software/yourobc/trackingMessages/constants
 */

// ============================================================================
// Public ID Prefix
// ============================================================================

/**
 * Prefix for tracking message public IDs
 * Format: tmsg_[random_string]
 */
export const TRACKING_MESSAGE_PUBLIC_ID_PREFIX = 'tmsg_' as const

// ============================================================================
// Display Field
// ============================================================================

/**
 * Main display field for tracking messages
 * Used in UI listings and references
 */
export const TRACKING_MESSAGE_DISPLAY_FIELD = 'subject' as const

/**
 * Fallback display field when subject is empty
 */
export const TRACKING_MESSAGE_FALLBACK_DISPLAY_FIELD = 'template' as const

// ============================================================================
// Template Variables
// ============================================================================

/**
 * Common template variables used across tracking messages
 */
export const COMMON_TEMPLATE_VARIABLES = [
  'customerName',
  'customerEmail',
  'trackingNumber',
  'shipmentId',
  'pickupDate',
  'deliveryDate',
  'origin',
  'destination',
  'carrierName',
  'serviceType',
  'status',
  'estimatedDelivery',
  'currentLocation',
  'nextUpdateTime',
  'supportEmail',
  'supportPhone',
  'customerPortalUrl',
] as const

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for new tracking messages
 */
export const TRACKING_MESSAGE_DEFAULTS = {
  isActive: true,
  isOfficial: false,
  variables: [],
  visibility: 'private' as const,
  difficulty: 'beginner' as const,
} as const

// ============================================================================
// Validation
// ============================================================================

/**
 * Maximum lengths for text fields
 */
export const TRACKING_MESSAGE_LIMITS = {
  name: 200,
  description: 1000,
  subject: 200,
  template: 5000,
  useCase: 500,
} as const

/**
 * Template variable pattern
 * Matches {variableName} patterns in templates
 */
export const TEMPLATE_VARIABLE_PATTERN = /\{([a-zA-Z0-9_]+)\}/g

// ============================================================================
// Query Limits
// ============================================================================

/**
 * Default pagination limit for tracking message queries
 */
export const DEFAULT_QUERY_LIMIT = 50

/**
 * Maximum pagination limit for tracking message queries
 */
export const MAX_QUERY_LIMIT = 100
