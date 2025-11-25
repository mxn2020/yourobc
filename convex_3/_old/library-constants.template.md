// convex/lib/boilerplate/[module_name]/constants.ts

export const [MODULE]_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    COMPLETED: 'completed',
    ON_HOLD: 'on_hold',
    CANCELLED: 'cancelled',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },
  PERMISSIONS: {
    VIEW: '[module_name].view',
    CREATE: '[module_name].create',
    EDIT: '[module_name].edit',
    DELETE: '[module_name].delete',
    MANAGE_TEAM: '[module_name].manage_team',
  },
  LIMITS: {
    MAX_NAME_LENGTH: 100,  // OR: MAX_TITLE_LENGTH, MAX_DISPLAY_NAME_LENGTH
    MAX_DESCRIPTION_LENGTH: 2000,
    MAX_TAGS: 10,
    MAX_MEMBERS: 50,
  },
} as const;

export const PRIORITY_WEIGHTS = {
  [[MODULE]_CONSTANTS.PRIORITY.LOW]: 1,
  [[MODULE]_CONSTANTS.PRIORITY.MEDIUM]: 2,
  [[MODULE]_CONSTANTS.PRIORITY.HIGH]: 3,
  [[MODULE]_CONSTANTS.PRIORITY.URGENT]: 4,
  [[MODULE]_CONSTANTS.PRIORITY.CRITICAL]: 5,
} as const;

// Type exports for TypeScript safety
export type [Entity]Status = typeof [MODULE]_CONSTANTS.STATUS[keyof typeof [MODULE]_CONSTANTS.STATUS];
export type [Entity]Priority = typeof [MODULE]_CONSTANTS.PRIORITY[keyof typeof [MODULE]_CONSTANTS.PRIORITY];
export type [Entity]Visibility = typeof [MODULE]_CONSTANTS.VISIBILITY[keyof typeof [MODULE]_CONSTANTS.VISIBILITY];


// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * This file contains business constants and configuration.
 *
 * ✅ DO put here:
 * - Permission strings
 * - Status/Priority/Visibility constant values (matching schema)
 * - Limit values (max lengths, counts)
 * - Weight mappings for sorting/comparison
 * - Type exports derived from constants
 *
 * ❌ DON'T put here:
 * - Convex validators → Those live in schema validators.ts
 * - Validation logic → Goes in utils.ts
 * - Business logic → Goes in mutations/queries
 * - UI-specific constants (colors, labels) → Keep those in frontend
 *
 * MAIN DISPLAY FIELD:
 * Every table needs a main display field (name, title, or displayName).
 * Define the corresponding MAX_*_LENGTH constant in the LIMITS section above.
 * Choose: MAX_NAME_LENGTH (entities), MAX_TITLE_LENGTH (content), or MAX_DISPLAY_NAME_LENGTH (ambiguous).
 *
 * PATTERN (Validators vs Constants):
 *
 * VALIDATORS (schema/validators.ts) - For type safety in schema/mutations/queries:
 *   export const {module}Validators = {
 *     status: v.union(v.literal('active'), v.literal('archived'), ...)
 *   }
 *
 * CONSTANTS (lib/constants.ts) - For runtime comparisons in business logic:
 *   export const [MODULE]_CONSTANTS = {
 *     STATUS: { ACTIVE: 'active', ARCHIVED: 'archived', ... }
 *   }
 *
 * WHY BOTH?
 * - Validators: Used in schema definitions and mutation/query args for type safety
 * - Constants: Used in handler logic for readable comparisons
 *   Example: if (entity.status === [MODULE]_CONSTANTS.STATUS.ACTIVE) { ... }
 *
 * IMPORTANT: Keep constants synchronized with validators!
 * - The string values must match exactly
 * - Validators are the source of truth for allowed values
 * - Constants provide readable access for business logic
 */
