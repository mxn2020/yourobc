// convex/lib/boilerplate/projects/projects/constants.ts
// Business constants, permissions, and limits for projects module

export const PROJECTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'projects:view',
    CREATE: 'projects:create',
    EDIT: 'projects:edit',
    DELETE: 'projects:delete',
    MANAGE_TEAM: 'projects:manage_team',
    BULK_EDIT: 'projects:bulk_edit',
  },

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

  RISK_LEVEL: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 2000,
    MIN_TITLE_LENGTH: 1,
    MAX_TAGS: 10,
    MAX_COLLABORATORS: 50,
  },

  VALIDATION: {
    TITLE_PATTERN: /^.+$/,
  },
} as const;

// Priority weights for sorting
export const PRIORITY_WEIGHTS = {
  [PROJECTS_CONSTANTS.PRIORITY.LOW]: 1,
  [PROJECTS_CONSTANTS.PRIORITY.MEDIUM]: 2,
  [PROJECTS_CONSTANTS.PRIORITY.HIGH]: 3,
  [PROJECTS_CONSTANTS.PRIORITY.URGENT]: 4,
  [PROJECTS_CONSTANTS.PRIORITY.CRITICAL]: 5,
} as const;
