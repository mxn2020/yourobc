// convex/lib/system/blog/posts/constants.ts
// Business constants, permissions, and limits for blog posts module

export const BLOG_POSTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'blog_posts:view',
    CREATE: 'blog_posts:create',
    EDIT: 'blog_posts:edit',
    DELETE: 'blog_posts:delete',
    PUBLISH: 'blog_posts:publish',
    SCHEDULE: 'blog_posts:schedule',
    BULK_EDIT: 'blog_posts:bulk_edit',
    MANAGE_SEO: 'blog_posts:manage_seo',
  },

  STATUS: {
    DRAFT: 'draft',
    SCHEDULED: 'scheduled',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },

  VISIBILITY: {
    PUBLIC: 'public',
    PRIVATE: 'private',
    PASSWORD: 'password',
    MEMBERS_ONLY: 'members_only',
    UNLISTED: 'unlisted',
  },

  SYNC_STATUS: {
    SYNCED: 'synced',
    PENDING: 'pending',
    ERROR: 'error',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 300,
    MAX_EXCERPT_LENGTH: 500,
    MAX_CONTENT_LENGTH: 1000000, // 1MB
    MIN_TITLE_LENGTH: 3,
    MAX_TAGS: 20,
    MAX_SEO_TITLE_LENGTH: 70,
    MAX_SEO_DESCRIPTION_LENGTH: 160,
    MAX_SEO_KEYWORDS: 10,
    MAX_SLUG_LENGTH: 200,
  },

  VALIDATION: {
    TITLE_PATTERN: /^.+$/,
    SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    URL_PATTERN: /^https?:\/\/.+/,
  },

  DEFAULTS: {
    STATUS: 'draft' as const,
    VISIBILITY: 'private' as const,
    ALLOW_COMMENTS: true,
    FEATURED: false,
    IS_PINNED: false,
    NO_INDEX: false,
  },
} as const;
