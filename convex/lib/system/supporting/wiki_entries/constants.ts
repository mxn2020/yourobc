// convex/lib/system/supporting/wiki_entries/constants.ts
// Business constants for system wiki entries module

export const SYSTEM_WIKI_ENTRIES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:wiki_entries:view',
    CREATE: 'system:wiki_entries:create',
    EDIT: 'system:wiki_entries:edit',
    DELETE: 'system:wiki_entries:delete',
    PUBLISH: 'system:wiki_entries:publish',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_SLUG_LENGTH: 200,
    MAX_CONTENT_LENGTH: 20000,
    MAX_TAGS: 20,
  },

  DEFAULTS: {
    STATUS: 'draft' as const,
  },
} as const;

export const SYSTEM_WIKI_ENTRIES_VALUES = {
  // Entry types/statuses defined in schema validators
} as const;
