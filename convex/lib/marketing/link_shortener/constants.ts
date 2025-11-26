// convex/lib/marketing/link_shortener/constants.ts

export const LINK_SHORTENER_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',
    PAUSED: 'paused',
    EXPIRED: 'expired',
    ARCHIVED: 'archived',
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
  PERMISSIONS: {
    VIEW: 'link_shortener.view',
    CREATE: 'link_shortener.create',
    EDIT: 'link_shortener.edit',
    DELETE: 'link_shortener.delete',
    VIEW_ANALYTICS: 'link_shortener.view_analytics',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
    MAX_URL_LENGTH: 2000,
    MAX_SHORT_CODE_LENGTH: 20,
    MAX_TAGS: 20,
    MAX_VARIANTS: 5,
  },
} as const;

export type LinkStatus = typeof LINK_SHORTENER_CONSTANTS.STATUS[keyof typeof LINK_SHORTENER_CONSTANTS.STATUS];
