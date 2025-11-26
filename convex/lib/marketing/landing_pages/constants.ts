// convex/lib/marketing/landing_pages/constants.ts

export const LANDING_PAGE_CONSTANTS = {
  STATUS: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    ARCHIVED: 'archived',
    SCHEDULED: 'scheduled',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },
  PERMISSIONS: {
    VIEW: 'landing_pages.view',
    CREATE: 'landing_pages.create',
    EDIT: 'landing_pages.edit',
    DELETE: 'landing_pages.delete',
    PUBLISH: 'landing_pages.publish',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_SLUG_LENGTH: 100,
    MAX_SECTIONS: 20,
    MAX_TAGS: 20,
  },
} as const;

export type LandingPageStatus = typeof LANDING_PAGE_CONSTANTS.STATUS[keyof typeof LANDING_PAGE_CONSTANTS.STATUS];
