// src/features/yourobc/supporting/shared/index.ts

/**
 * Shared Types and Constants for YourOBC Supporting Modules
 *
 * This module provides common types and constants used across all supporting features
 * (comments, follow-up reminders, wiki, etc.)
 */

// Export types
export type { SupportingEntityType } from './types'
export {
  SUPPORTING_ENTITY_TYPES,
  isSupportingEntityType,
} from './types'

// Export constants
export {
  ENTITY_TYPE_LABELS,
  getEntityTypeLabel,
  getSafeEntityTypeLabel,
  getAllEntityTypes,
  getEntityTypeOptions,
} from './constants'
