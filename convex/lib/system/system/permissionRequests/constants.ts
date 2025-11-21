// convex/lib/system/system/permissionRequests/constants.ts
// Business constants, permissions, and limits for permissionRequests module

export const PERMISSION_REQUESTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'permissionRequests:view',
    CREATE: 'permissionRequests:create',
    EDIT: 'permissionRequests:edit',
    DELETE: 'permissionRequests:delete',
  },

  LIMITS: {
    MAX_PERMISSION_LENGTH: 200,
    MIN_PERMISSION_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  VALIDATION: {
    PERMISSION_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  },
} as const;
