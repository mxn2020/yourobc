// convex/lib/yourobc/supporting/inquiry_sources/constants.ts
// Business constants, permissions, and limits for inquiry sources module

export const INQUIRY_SOURCES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'inquiry_sources:view',
    CREATE: 'inquiry_sources:create',
    EDIT: 'inquiry_sources:edit',
    DELETE: 'inquiry_sources:delete',
  },

  DEFAULTS: {
    IS_ACTIVE: true,
  },

  VALIDATION: {
    CODE_PATTERN: /^[A-Z0-9_]+$/,
  },
} as const;

export const INQUIRY_SOURCES_VALUES = {
  // Add enum values here if needed
} as const;
