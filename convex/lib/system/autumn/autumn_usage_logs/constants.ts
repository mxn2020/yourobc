// convex/lib/boilerplate/autumn/autumn_usage_logs/constants.ts
// Business constants, permissions, and limits for autumn usage logs module

export const AUTUMN_USAGE_LOGS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'autumn_usage_logs:view',
    CREATE: 'autumn_usage_logs:create',
    EDIT: 'autumn_usage_logs:edit',
    DELETE: 'autumn_usage_logs:delete',
    SYNC: 'autumn_usage_logs:sync',
  },

  SYNC_STATUS: {
    SYNCED: true,
    NOT_SYNCED: false,
  },

  LIMITS: {
    MAX_NAME_LENGTH: 200,
    MIN_NAME_LENGTH: 3,
    MAX_BATCH_SIZE: 100,
    SYNC_RETRY_DELAY_MS: 60000, // 1 minute
    MAX_SYNC_RETRIES: 3,
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_]+$/,
    MIN_VALUE: 0,
  },
} as const;
