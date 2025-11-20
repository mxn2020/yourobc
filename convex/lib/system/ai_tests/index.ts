// convex/lib/boilerplate/ai_tests/index.ts

/**
 * AI Tests module
 *
 * Provides functionality for managing and tracking AI model tests,
 * including queries, mutations, types, and utilities for AI test management.
 */

// Export constants
export { AI_TESTS_CONSTANTS } from './constants';

// Export types
export type {
  AITest,
  AITestId,
  AITestFilters,
  AITestsResponse,
  AITestStats,
  AITestUsage,
  TestResultError,
  AITestResult,
  AITestSummary,
  AITestStatus,
  AITestType,
  UpdateAITestData,
} from './types';

// Export queries
export { getAITests, getAITest, getAITestStats, getTestResults, getTestsByBatch } from './queries';

// Export mutations
export {
  createAITest,
  updateAITest,
  addTestResult,
  updateTestStatus,
  deleteAITest,
} from './mutations';

// Export permissions
export {
  canViewAITest,
  requireViewAITestAccess,
  canCreateAITest,
  canUpdateAITest,
  requireUpdateAITestAccess,
  canDeleteAITest,
  requireDeleteAITestAccess,
  filterAITestsByAccess,
} from './permissions';

// Export utils
export {
  getTimePeriodStarts,
  matchesTestSearch,
  calculateTestSummary,
  getDefaultTestSummary,
  validateTestData,
  groupTestsByField,
  calculateAverage,
  sanitizeSearchString,
} from './utils';
