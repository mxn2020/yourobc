// convex/lib/yourobc/supporting/inquiry_sources/constants.ts
// convex/yourobc/supporting/inquirySources/constants.ts
export const INQUIRY_SOURCE_CONSTANTS = {
  TYPE: {
    WEBSITE: 'website',
    REFERRAL: 'referral',
    PARTNER: 'partner',
    ADVERTISING: 'advertising',
    DIRECT: 'direct',
  },
  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_CODE_LENGTH: 20,
  },
  PERMISSIONS: {
    VIEW: 'inquiry_sources.view',
    CREATE: 'inquiry_sources.create',
    EDIT: 'inquiry_sources.edit',
    DELETE: 'inquiry_sources.delete',
  },
} as const;

