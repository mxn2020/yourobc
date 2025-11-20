// convex/lib/software/yourobc/tasks/constants.ts
/**
 * Tasks Constants
 *
 * Defines constants used throughout the tasks module.
 * Includes default values, configuration options, and common settings.
 *
 * @module convex/lib/software/yourobc/tasks/constants
 */

// ============================================================================
// Public ID Prefix
// ============================================================================

/**
 * Prefix for task public IDs
 * Format: task_[random_string]
 */
export const TASK_PUBLIC_ID_PREFIX = 'task_' as const

// ============================================================================
// Display Field
// ============================================================================

/**
 * Main display field for tasks
 * Used in UI listings and references
 */
export const TASK_DISPLAY_FIELD = 'title' as const

/**
 * Fallback display field when title is empty
 */
export const TASK_FALLBACK_DISPLAY_FIELD = 'description' as const

// ============================================================================
// Default Values
// ============================================================================

/**
 * Default values for new tasks
 */
export const TASK_DEFAULTS = {
  status: 'pending' as const,
  priority: 'medium' as const,
  visibility: 'private' as const,
  type: 'manual' as const,
  tags: [],
} as const

// ============================================================================
// Status Workflow
// ============================================================================

/**
 * Valid status transitions for task workflow
 * Maps current status to allowed next statuses
 */
export const TASK_STATUS_TRANSITIONS = {
  pending: ['in_progress', 'archived'],
  in_progress: ['completed', 'pending', 'archived'],
  completed: ['archived'],
  archived: [], // Cannot transition from archived
} as const

/**
 * Status colors for UI display
 */
export const TASK_STATUS_COLORS = {
  pending: '#FFA500', // Orange
  in_progress: '#1E90FF', // Blue
  completed: '#32CD32', // Green
  archived: '#808080', // Gray
} as const

// ============================================================================
// Priority Settings
// ============================================================================

/**
 * Priority weights for sorting (higher = more urgent)
 */
export const TASK_PRIORITY_WEIGHTS = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
} as const

/**
 * Priority colors for UI display
 */
export const TASK_PRIORITY_COLORS = {
  critical: '#DC143C', // Crimson
  high: '#FF4500', // OrangeRed
  medium: '#FFD700', // Gold
  low: '#90EE90', // LightGreen
} as const

// ============================================================================
// Validation
// ============================================================================

/**
 * Maximum lengths for text fields
 */
export const TASK_LIMITS = {
  title: 200,
  description: 2000,
  completionNotes: 1000,
  cancellationReason: 500,
  category: 100,
  tag: 50,
  maxTags: 20,
} as const

/**
 * Time limits (in milliseconds)
 */
export const TASK_TIME_LIMITS = {
  maxDueDateFuture: 365 * 24 * 60 * 60 * 1000, // 1 year
  overdueWarningThreshold: 24 * 60 * 60 * 1000, // 24 hours
} as const

// ============================================================================
// Query Limits
// ============================================================================

/**
 * Default pagination limit for task queries
 */
export const DEFAULT_QUERY_LIMIT = 50

/**
 * Maximum pagination limit for task queries
 */
export const MAX_QUERY_LIMIT = 100

// ============================================================================
// Task Categories
// ============================================================================

/**
 * Common task categories
 */
export const COMMON_TASK_CATEGORIES = [
  'documentation',
  'customs',
  'pickup',
  'delivery',
  'notification',
  'follow_up',
  'review',
  'approval',
  'other',
] as const

// ============================================================================
// Permissions
// ============================================================================

/**
 * Task permission levels
 */
export const TASK_PERMISSIONS = {
  OWNER: 'owner',
  ASSIGNED: 'assigned',
  VIEWER: 'viewer',
  ADMIN: 'admin',
} as const
