// convex/lib/{category}/{entity}/{module}/constants.ts
// Business constants for {module} module

/**
 * Module permissions
 */
export const {MODULE}_CONSTANTS = {
  PERMISSIONS: {
    VIEW: '{module}:view',
    CREATE: '{module}:create',
    EDIT: '{module}:edit',
    DELETE: '{module}:delete',
    PUBLISH: '{module}:publish',
    BULK_EDIT: '{module}:bulk_edit',
    // Add more permissions as needed...
  },

  STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    COMPLETED: 'completed',
    // Add more statuses as needed...
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    // Add more priorities as needed...
  },

  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
    // Add more visibility options as needed...
  },

  LIMITS: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAGS: 10,
    MAX_ATTACHMENTS: 20,
    // Add more limits as needed...
  },
} as const;

/**
 * Values arrays for validation
 */
export const {MODULE}_VALUES = {
  status: Object.values({MODULE}_CONSTANTS.STATUS),
  priority: Object.values({MODULE}_CONSTANTS.PRIORITY),
  visibility: Object.values({MODULE}_CONSTANTS.VISIBILITY),
  // Add more value arrays as needed...
} as const;

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating constants.ts:
 * [ ] Define {MODULE}_CONSTANTS object
 * [ ] Add PERMISSIONS object with all permissions
 * [ ] Add STATUS/PRIORITY/VISIBILITY enums
 * [ ] Add LIMITS object with validation rules
 * [ ] Export {MODULE}_VALUES for arrays
 * [ ] Export with 'as const'
 * [ ] Mirror schema validators values
 *
 * DO:
 * [ ] Use SCREAMING_SNAKE_CASE for constants
 * [ ] Keep values in sync with schema validators
 * [ ] Add descriptive permission names
 * [ ] Document business limits
 *
 * DON'T:
 * [ ] Duplicate schema validator definitions
 * [ ] Use magic numbers without constants
 * [ ] Skip 'as const' declaration
 * [ ] Define validators here (use schema validators)
 */
