// convex/lib/boilerplate/ai_logs/constants.ts

/**
 * Constants for AI Logs module
 */
export const AI_LOGS_CONSTANTS = {
  // Permissions
  PERMISSIONS: {
    VIEW: 'ai_logs:view',
    CREATE: 'ai_logs:create',
    UPDATE: 'ai_logs:update',
    DELETE: 'ai_logs:delete',
  },

  REQUEST_TYPES: {
    TEXT_GENERATION: 'text_generation',
    STREAMING: 'streaming',
    OBJECT_GENERATION: 'object_generation',
    EMBEDDING: 'embedding',
    IMAGE_GENERATION: 'image_generation',
    SPEECH: 'speech',
    TRANSCRIPTION: 'transcription',
    TEST: 'test',
  },

  LIMITS: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_LOGS_PER_QUERY: 1000,
    CLEANUP_RETENTION_DAYS: 90,
  },

  TIME_PERIODS: {
    DAY_MS: 24 * 60 * 60 * 1000,
    WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  },

  CACHE_PROVIDERS: {
    ANTHROPIC: 'anthropic',
    OPENAI: 'openai',
    OTHER: 'other',
  },

  CACHE_TYPES: {
    EPHEMERAL: 'ephemeral',
    PERSISTENT: 'persistent',
    AUTOMATIC: 'automatic',
  },

  FILE_TYPES: {
    INPUT: 'input',
    OUTPUT: 'output',
  },

  RESPONSE_FORMAT_TYPES: {
    TEXT: 'text',
    JSON: 'json',
  },
} as const;
