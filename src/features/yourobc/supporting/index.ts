// src/features/yourobc/supporting/index.ts

/**
 * YourOBC Supporting Modules
 *
 * This module provides supporting functionality for the YourOBC CRM system:
 * - Comments: Add notes and comments to any entity
 * - Exchange Rates: Manage EUR/USD currency conversion
 * - Follow-up Reminders: Track tasks and deadlines
 * - Inquiry Sources: Track where customers come from
 * - Wiki: Internal knowledge base for SOPs, airline rules, and partner info
 *
 * Features can be enabled/disabled via the config file.
 *
 * Based on YOUROBC.md sections 1, 4, 5, 10, and "Zusatz-Tools".
 */

// ============================================================================
// Configuration
// ============================================================================
export * from './config/supporting.config'

// ============================================================================
// Shared Types and Constants
// ============================================================================
export * from './shared'

// ============================================================================
// Comments Module
// ============================================================================
export * from './comments'

// ============================================================================
// Exchange Rates Module
// ============================================================================
export * from './exchange-rates'

// ============================================================================
// Follow-up Reminders Module
// ============================================================================
export * from './followup-reminders'

// ============================================================================
// Inquiry Sources Module
// ============================================================================
export * from './inquiry-sources'

// ============================================================================
// Wiki Module
// ============================================================================
export * from './wiki'

// ============================================================================
// Module Availability
// ============================================================================
import {
  isCommentsEnabled,
  isExchangeRatesEnabled,
  isFollowupRemindersEnabled,
  isInquirySourcesEnabled,
  isWikiEnabled,
} from './config/supporting.config'

/**
 * Object containing the enabled state of each supporting module
 */
export const SUPPORTING_MODULES = {
  comments: isCommentsEnabled(),
  exchangeRates: isExchangeRatesEnabled(),
  followupReminders: isFollowupRemindersEnabled(),
  inquirySources: isInquirySourcesEnabled(),
  wiki: isWikiEnabled(),
} as const

/**
 * Check if any supporting module is enabled
 */
export { hasAnySupportingModuleEnabled, getEnabledModules } from './config/supporting.config'

/**
 * Module Information
 *
 * This constant provides metadata about each supporting module for UI display
 */
export const SUPPORTING_MODULE_INFO = {
  comments: {
    name: 'Comments',
    description: 'Add notes and discussions to any entity',
    icon: 'MessageSquare',
    color: 'blue',
  },
  exchangeRates: {
    name: 'Exchange Rates',
    description: 'Manage EUR/USD currency conversion',
    icon: 'DollarSign',
    color: 'green',
  },
  followupReminders: {
    name: 'Follow-up Reminders',
    description: 'Track tasks and deadlines',
    icon: 'Bell',
    color: 'orange',
  },
  inquirySources: {
    name: 'Inquiry Sources',
    description: 'Track customer inquiry origins',
    icon: 'Target',
    color: 'purple',
  },
  wiki: {
    name: 'Wiki',
    description: 'Internal knowledge base',
    icon: 'BookOpen',
    color: 'indigo',
  },
} as const

/**
 * Usage Example:
 *
 * ```typescript
 * import { SUPPORTING_MODULES, CommentsSection } from '@/features/yourobc/supporting'
 *
 * // Check if module is enabled
 * if (SUPPORTING_MODULES.comments) {
 *   return <CommentsSection entityType="yourobc_customer" entityId={customerId} />
 * }
 * ```
 */
