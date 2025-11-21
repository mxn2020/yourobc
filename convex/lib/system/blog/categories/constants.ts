// convex/lib/system/blog/categories/constants.ts
// Business constants, permissions, and limits for blog categories module

export const BLOG_CATEGORIES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'blog_categories:view',
    CREATE: 'blog_categories:create',
    EDIT: 'blog_categories:edit',
    DELETE: 'blog_categories:delete',
    BULK_EDIT: 'blog_categories:bulk_edit',
  },

  STATUS: {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    ARCHIVED: 'archived',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MIN_TITLE_LENGTH: 2,
    MAX_SLUG_LENGTH: 100,
    MAX_DEPTH: 5, // Maximum nesting depth
  },

  VALIDATION: {
    TITLE_PATTERN: /^[a-zA-Z0-9\s\-_&]+$/,
    SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  },

  DEFAULTS: {
    STATUS: 'active' as const,
    DEPTH: 0,
    ORDER: 0,
  },
} as const;
