// convex/lib/boilerplate/ai_logs/index.ts

/**
 * AI Logs module
 *
 * Provides functionality for logging and tracking AI API requests,
 * including queries, mutations, types, and utilities for AI logging.
 */

// Export constants
export { AI_LOGS_CONSTANTS } from './constants';

// Export types
export type {
  AILog,
  AILogId,
  AILogFilters,
  AILogsResponse,
  AILogStats,
  AIParameters,
  AIUsage,
  AIToolCall,
  AICacheInfo,
  AIMetadata,
  AIFile,
  UpdateAILogData,
  AIRequestType,
} from './types';

// Export queries
export { getAILogs, getAILog, getAILogStats } from './queries';

// Export mutations
export { createAILog, updateAILog, deleteAILog } from './mutations';

// Export permissions
export {
  canViewAILog,
  requireViewAILogAccess,
  canCreateAILog,
  canUpdateAILog,
  requireUpdateAILogAccess,
  canDeleteAILog,
  requireDeleteAILogAccess,
  filterAILogsByAccess,
} from './permissions';

// Export utils
export {
  getDefaultParameters,
  getDefaultUsage,
  getDefaultMetadata,
  getTimePeriodStarts,
  sanitizeSearchString,
  validateAILogData,
  calculateAverage,
  groupLogsByField,
  matchesSearch,
} from './utils';
