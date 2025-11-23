// convex/lib/yourobc/supporting/wiki_entries/constants.ts
// Business constants, permissions, and limits for wiki entries module

export const WIKI_ENTRIES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'wiki_entries:view',
    CREATE: 'wiki_entries:create',
    EDIT: 'wiki_entries:edit',
    DELETE: 'wiki_entries:delete',
    PUBLISH: 'wiki_entries:publish',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_SLUG_LENGTH: 250,
    MAX_CONTENT_LENGTH: 100000,
    MAX_TAGS: 20,
    MAX_TAG_LENGTH: 50,
  },

  DEFAULTS: {
    IS_PUBLIC: false,
    STATUS: 'draft' as const,
    VIEW_COUNT: 0,
  },

  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },
} as const;

export const WIKI_ENTRIES_VALUES = {
  statuses: Object.values(WIKI_ENTRIES_CONSTANTS.STATUS),
} as const;
