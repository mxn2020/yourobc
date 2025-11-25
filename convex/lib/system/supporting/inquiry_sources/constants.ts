// convex/lib/system/supporting/inquiry_sources/constants.ts
// Business constants for system inquiry sources module

export const SYSTEM_INQUIRY_SOURCES_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'system:inquiry_sources:view',
    CREATE: 'system:inquiry_sources:create',
    EDIT: 'system:inquiry_sources:edit',
    DELETE: 'system:inquiry_sources:delete',
  },

  DEFAULTS: {
    IS_ACTIVE: true,
  },

  VALIDATION: {
    CODE_PATTERN: /^[A-Z0-9_]+$/,
  },
} as const;

export const SYSTEM_INQUIRY_SOURCES_VALUES = {
  // Types defined in schema validators
} as const;
