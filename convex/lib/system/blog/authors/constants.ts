// convex/lib/system/blog/authors/constants.ts
export const BLOG_AUTHORS_CONSTANTS = {
  PERMISSIONS: { VIEW: 'blog_authors:view', CREATE: 'blog_authors:create', EDIT: 'blog_authors:edit', DELETE: 'blog_authors:delete' },
  STATUS: { ACTIVE: 'active', INACTIVE: 'inactive' },
  LIMITS: { MAX_TITLE_LENGTH: 100, MAX_BIO_LENGTH: 1000, MIN_TITLE_LENGTH: 2, MAX_EMAIL_LENGTH: 255 },
  VALIDATION: { EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, URL_PATTERN: /^https?:\/\/.+/ },
  DEFAULTS: { STATUS: 'active' as const, IS_ACTIVE: true, NOTIFICATION_ENABLED: true },
} as const;
