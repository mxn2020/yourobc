// convex/lib/system/blog/blog/constants.ts
// Business constants, permissions, and limits for blog module

export const BLOG_CONSTANTS = {
  PERMISSIONS: {
    // Post permissions
    POST_VIEW: 'blog:post:view',
    POST_CREATE: 'blog:post:create',
    POST_UPDATE: 'blog:post:update',
    POST_DELETE: 'blog:post:delete',
    POST_PUBLISH: 'blog:post:publish',
    POST_SCHEDULE: 'blog:post:schedule',

    // Category permissions
    CATEGORY_VIEW: 'blog:category:view',
    CATEGORY_CREATE: 'blog:category:create',
    CATEGORY_UPDATE: 'blog:category:update',
    CATEGORY_DELETE: 'blog:category:delete',

    // Tag permissions
    TAG_VIEW: 'blog:tag:view',
    TAG_CREATE: 'blog:tag:create',
    TAG_UPDATE: 'blog:tag:update',
    TAG_DELETE: 'blog:tag:delete',

    // Author permissions
    AUTHOR_VIEW: 'blog:author:view',
    AUTHOR_CREATE: 'blog:author:create',
    AUTHOR_UPDATE: 'blog:author:update',
  },

  LIMITS: {
    // Post fields
    TITLE_MIN: 3,
    TITLE_MAX: 200,
    SLUG_MIN: 3,
    SLUG_MAX: 200,
    EXCERPT_MAX: 500,
    CONTENT_MAX: 1000000, // 1MB of text

    // SEO fields
    SEO_TITLE_MAX: 60,
    SEO_DESCRIPTION_MAX: 160,
    SEO_KEYWORDS_MAX: 10,
    FOCUS_KEYWORD_MAX: 100,

    // Category/Tag fields
    CATEGORY_NAME_MAX: 100,
    TAG_NAME_MAX: 50,
    DESCRIPTION_MAX: 500,

    // Author fields
    AUTHOR_NAME_MAX: 100,
    AUTHOR_BIO_MAX: 500,
    AUTHOR_URL_MAX: 300,

    // Array limits
    MAX_TAGS_PER_POST: 10,
    MAX_CO_AUTHORS: 5,
    MAX_CATEGORIES_DEPTH: 3,

    // Pagination
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,

    // Search
    MIN_SEARCH_QUERY_LENGTH: 2,
    MAX_SEARCH_RESULTS: 50,
  },

  DEFAULTS: {
    POST_STATUS: 'draft' as const,
    POST_VISIBILITY: 'public' as const,
    ALLOW_COMMENTS: true,
    FEATURED: false,
    IS_PINNED: false,
    NO_INDEX: false,

    // Pagination
    PAGE_SIZE: 20,

    // Read time calculation
    WORDS_PER_MINUTE: 200,

    // Excerpt generation
    EXCERPT_LENGTH: 200,
    EXCERPT_SUFFIX: '...',

    // Slug generation
    SLUG_SEPARATOR: '-',
    SLUG_MAX_WORDS: 10,

    // Categories
    CATEGORY_ORDER_INCREMENT: 10,
    ROOT_CATEGORY_DEPTH: 0,

    // Sync
    SYNC_INTERVAL_MINUTES: 60,
    SYNC_DIRECTION: 'bidirectional' as const,
    AUTO_SYNC: false,

    // Reminders
    REMINDER_MINUTES_BEFORE: 30,
    EMAIL_REMINDER: true,
  },

  READ_TIME: {
    WORDS_PER_MINUTE: 200,
    IMAGE_SECONDS: 12,
    CODE_BLOCK_SECONDS: 10,
    MIN_READ_TIME: 1,
  },

  SEO: {
    // Title
    TITLE_MIN: 30,
    TITLE_MAX: 60,
    TITLE_OPTIMAL: 55,

    // Description
    DESCRIPTION_MIN: 50,
    DESCRIPTION_MAX: 160,
    DESCRIPTION_OPTIMAL: 155,

    // Keywords
    KEYWORDS_MIN: 3,
    KEYWORDS_MAX: 10,
    KEYWORDS_OPTIMAL: 5,

    // Focus keyword
    FOCUS_KEYWORD_MIN_DENSITY: 0.005,
    FOCUS_KEYWORD_MAX_DENSITY: 0.03,
    FOCUS_KEYWORD_OPTIMAL_DENSITY: 0.01,

    // Content
    CONTENT_MIN_WORDS: 300,
    CONTENT_OPTIMAL_WORDS: 1500,

    // Images
    IMAGE_ALT_TEXT_MAX: 125,
    IMAGE_MAX_SIZE_MB: 5,

    // Twitter card types
    TWITTER_CARD_TYPES: [
      'summary',
      'summary_large_image',
      'app',
      'player',
    ] as const,
  },

  SLUG_RULES: {
    // Reserved slugs that cannot be used
    RESERVED_SLUGS: [
      'admin',
      'api',
      'blog',
      'dashboard',
      'login',
      'logout',
      'register',
      'settings',
      'profile',
      'search',
      'new',
      'edit',
      'delete',
      'create',
      'update',
    ],

    // Common stop words to remove from slugs (optional)
    STOP_WORDS: [
      'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for',
      'from', 'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on',
      'that', 'the', 'to', 'was', 'will', 'with',
    ],
  },

  PROVIDER_LIMITS: {
    ghost: {
      MAX_POSTS_PER_SYNC: 100,
      RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
      RATE_LIMIT_REQUESTS_PER_HOUR: 1000,
    },
    contentful: {
      MAX_POSTS_PER_SYNC: 100,
      RATE_LIMIT_REQUESTS_PER_SECOND: 10,
      MAX_ASSET_SIZE_MB: 50,
    },
    sanity: {
      MAX_POSTS_PER_SYNC: 1000,
      RATE_LIMIT_REQUESTS_PER_SECOND: 10,
      MAX_DOCUMENT_SIZE_MB: 16,
    },
    wordpress: {
      MAX_POSTS_PER_REQUEST: 100,
      RATE_LIMIT_REQUESTS_PER_MINUTE: 60,
    },
    medium: {
      MAX_POSTS_PER_USER: 100,
      RATE_LIMIT_REQUESTS_PER_HOUR: 100,
    },
  },

  ERROR_MESSAGES: {
    // Post errors
    POST_NOT_FOUND: 'Post not found',
    POST_ALREADY_PUBLISHED: 'Post is already published',
    POST_SLUG_EXISTS: 'A post with this slug already exists',
    POST_TITLE_REQUIRED: 'Post title is required',
    POST_CONTENT_REQUIRED: 'Post content is required',
    POST_TITLE_TOO_SHORT: 'Post title must be at least 3 characters',
    POST_TITLE_TOO_LONG: 'Post title must be less than 200 characters',

    // Category errors
    CATEGORY_NOT_FOUND: 'Category not found',
    CATEGORY_NAME_REQUIRED: 'Category name is required',
    CATEGORY_HAS_POSTS: 'Cannot delete category with posts',
    CATEGORY_MAX_DEPTH: 'Category nesting cannot exceed 3 levels',

    // Tag errors
    TAG_NOT_FOUND: 'Tag not found',
    TAG_NAME_REQUIRED: 'Tag name is required',

    // Author errors
    AUTHOR_NOT_FOUND: 'Author not found',
    AUTHOR_EMAIL_REQUIRED: 'Author email is required',
    AUTHOR_EMAIL_EXISTS: 'An author with this email already exists',

    // Permission errors
    NOT_AUTHORIZED: 'You are not authorized to perform this action',
    NOT_POST_AUTHOR: 'You are not the author of this post',

    // Validation errors
    INVALID_DATE: 'Invalid date provided',
    INVALID_STATUS: 'Invalid post status',
    INVALID_VISIBILITY: 'Invalid visibility setting',
    PASSWORD_REQUIRED: 'Password is required for password-protected posts',

    // SEO errors
    SEO_TITLE_TOO_LONG: 'SEO title must be less than 60 characters',
    SEO_DESCRIPTION_TOO_LONG: 'SEO description must be less than 160 characters',

    // Provider errors
    PROVIDER_NOT_CONFIGURED: 'Blog provider is not configured',
    PROVIDER_SYNC_FAILED: 'Failed to sync with external provider',
    PROVIDER_NOT_FOUND: 'Provider not found',

    // Generic errors
    INVALID_INPUT: 'Invalid input provided',
    DATABASE_ERROR: 'Database operation failed',
    UNKNOWN_ERROR: 'An unknown error occurred',
  },

  SUCCESS_MESSAGES: {
    POST_CREATED: 'Post created successfully',
    POST_UPDATED: 'Post updated successfully',
    POST_DELETED: 'Post deleted successfully',
    POST_PUBLISHED: 'Post published successfully',
    POST_SCHEDULED: 'Post scheduled successfully',
    POST_UNPUBLISHED: 'Post unpublished successfully',
    POST_ARCHIVED: 'Post archived successfully',

    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',

    TAG_CREATED: 'Tag created successfully',
    TAG_UPDATED: 'Tag updated successfully',
    TAG_DELETED: 'Tag deleted successfully',
    TAG_MERGED: 'Tags merged successfully',

    AUTHOR_CREATED: 'Author created successfully',
    AUTHOR_UPDATED: 'Author updated successfully',

    SYNC_COMPLETED: 'Sync completed successfully',
    PROVIDER_CONFIGURED: 'Provider configured successfully',
  },

  VALIDATION_PATTERNS: {
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/.+/,
    HEX_COLOR: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    TWITTER_HANDLE: /^@?[A-Za-z0-9_]{1,15}$/,
  },

  FEATURES: {
    ENABLE_SERIES: true,
    ENABLE_COAUTHORS: true,
    ENABLE_REACTIONS: true,
    ENABLE_SOCIAL_SHARE: true,
    ENABLE_READING_PROGRESS: true,
    ENABLE_TABLE_OF_CONTENTS: true,
    ENABLE_RELATED_POSTS: true,
    ENABLE_AUTHOR_BOX: true,
    ENABLE_PASSWORD_PROTECTION: true,
    ENABLE_MEMBERS_ONLY: true,
    ENABLE_SCHEDULED_PUBLISHING: true,
    ENABLE_EXTERNAL_PROVIDERS: true,
  },
} as const;
