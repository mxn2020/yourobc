// convex/lib/system/system/systemMetrics/constants.ts
// Business constants, permissions, and limits for systemMetrics module

export const SYSTEM_METRICS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'systemMetrics:view',
    CREATE: 'systemMetrics:create',
    EDIT: 'systemMetrics:edit',
    DELETE: 'systemMetrics:delete',
  },

  LIMITS: {
    MAX_METRICTYPE_LENGTH: 200,
    MIN_METRICTYPE_LENGTH: 3,
    MAX_DESCRIPTION_LENGTH: 1000,
  },

  VALIDATION: {
    METRICTYPE_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
  },
} as const;
