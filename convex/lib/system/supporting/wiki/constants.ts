// convex/lib/boilerplate/supporting/wiki/constants.ts

/**
 * Wiki Module Constants
 * Defines permissions, limits, and default values for the wiki module
 */
export const WIKI_CONSTANTS = {
  /**
   * Wiki entry types
   */
  TYPE: {
    GUIDE: 'guide',
    TUTORIAL: 'tutorial',
    REFERENCE: 'reference',
    FAQ: 'faq',
    PROCEDURE: 'procedure',
  },

  /**
   * Wiki entry status
   */
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
  },

  /**
   * Validation limits
   */
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_CONTENT_LENGTH: 50000,
    MAX_SLUG_LENGTH: 100,
    MAX_CATEGORY_LENGTH: 50,
    MAX_TAGS: 20,
  },

  /**
   * Permission strings for authorization
   */
  PERMISSIONS: {
    VIEW: 'wiki.view',
    VIEW_DRAFT: 'wiki.view_draft',
    CREATE: 'wiki.create',
    EDIT: 'wiki.edit',
    DELETE: 'wiki.delete',
    PUBLISH: 'wiki.publish',
  },

  /**
   * Default values
   */
  DEFAULT_VALUES: {
    STATUS: 'draft' as const,
    IS_PUBLIC: false,
    VIEW_COUNT: 0,
  },
} as const
