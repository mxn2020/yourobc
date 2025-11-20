// convex/lib/boilerplate/websites/websites/constants.ts
// Business constants, permissions, and limits for websites module

export const WEBSITES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'websites:view',
    CREATE: 'websites:create',
    EDIT: 'websites:edit',
    DELETE: 'websites:delete',
    PUBLISH: 'websites:publish',
    MANAGE_COLLABORATORS: 'websites:manage_collaborators',
    MANAGE_THEME: 'websites:manage_theme',
  },

  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
    MAINTENANCE: 'maintenance',
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

  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_CUSTOM_CSS_LENGTH: 50000,
    MAX_CUSTOM_JS_LENGTH: 50000,
    MAX_TAGS: 20,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    DOMAIN_PATTERN: /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
    SUBDOMAIN_PATTERN: /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/,
  },
} as const;

// Priority weights for sorting
export const PRIORITY_WEIGHTS = {
  [WEBSITES_CONSTANTS.PRIORITY.LOW]: 1,
  [WEBSITES_CONSTANTS.PRIORITY.MEDIUM]: 2,
  [WEBSITES_CONSTANTS.PRIORITY.HIGH]: 3,
  [WEBSITES_CONSTANTS.PRIORITY.URGENT]: 4,
  [WEBSITES_CONSTANTS.PRIORITY.CRITICAL]: 5,
} as const;
