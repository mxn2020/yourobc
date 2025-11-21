// convex/lib/system/blog/tags/constants.ts
// Business constants, permissions, and limits for blog tags module

export const BLOG_TAGS_CONSTANTS = {
  PERMISSIONS: { VIEW: 'blog_tags:view', CREATE: 'blog_tags:create', EDIT: 'blog_tags:edit', DELETE: 'blog_tags:delete' },
  STATUS: { ACTIVE: 'active', INACTIVE: 'inactive', ARCHIVED: 'archived' },
  LIMITS: { MAX_TITLE_LENGTH: 50, MAX_DESCRIPTION_LENGTH: 200, MIN_TITLE_LENGTH: 2, MAX_SLUG_LENGTH: 50 },
  VALIDATION: { TITLE_PATTERN: /^[a-zA-Z0-9\s\-_]+$/, SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  DEFAULTS: { STATUS: 'active' as const },
} as const;
