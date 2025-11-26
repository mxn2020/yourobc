// convex/lib/marketing/email_signatures/constants.ts

export const EMAIL_SIGNATURE_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active',
    DRAFT: 'draft',
    ARCHIVED: 'archived',
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
    VIEW: 'email_signatures.view',
    CREATE: 'email_signatures.create',
    EDIT: 'email_signatures.edit',
    DELETE: 'email_signatures.delete',
  },
  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MAX_FULL_NAME_LENGTH: 100,
    MAX_JOB_TITLE_LENGTH: 100,
    MAX_COMPANY_LENGTH: 100,
    MAX_SOCIAL_LINKS: 10,
    MAX_TAGS: 20,
  },
} as const;
