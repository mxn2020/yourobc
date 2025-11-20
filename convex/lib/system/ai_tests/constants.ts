// convex/lib/boilerplate/ai_tests/constants.ts

/**
 * Constants for AI Tests module
 */
export const AI_TESTS_CONSTANTS = {
  TEST_TYPES: {
    TEXT_GENERATION: 'text_generation',
    OBJECT_GENERATION: 'object_generation',
    EMBEDDING: 'embedding',
    IMAGE_GENERATION: 'image_generation',
    SPEECH: 'speech',
    TRANSCRIPTION: 'transcription',
    STREAMING: 'streaming',
    TOOL_CALLING: 'tool_calling',
    CACHING: 'caching',
    MULTIMODAL: 'multimodal',
    ERROR_HANDLING: 'error_handling',
  },

  TEST_STATUS: {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
  },

  RESULT_STATUS: {
    COMPLETED: 'completed',
    FAILED: 'failed',
  },

  LIMITS: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_TESTS_PER_QUERY: 1000,
    DEFAULT_ITERATIONS: 1,
    DEFAULT_TIMEOUT_MS: 30000,
    MAX_RECENT_TESTS: 10,
  },

  TIME_PERIODS: {
    DAY_MS: 24 * 60 * 60 * 1000,
    WEEK_MS: 7 * 24 * 60 * 60 * 1000,
  },

  DEFAULTS: {
    ITERATIONS: 1,
    TIMEOUT: 30000,
  },
} as const;
