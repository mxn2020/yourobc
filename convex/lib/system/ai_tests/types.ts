// convex/lib/boilerplate/ai_tests/types.ts

import { Doc, Id } from '@/generated/dataModel';

/**
 * AI Test document type from Convex database
 */
export type AITest = Doc<'aiTests'>;
export type AITestId = Id<'aiTests'>;

/**
 * Filter parameters for querying AI tests
 */
export interface AITestFilters {
  userId?: Id<'userProfiles'>;
  modelId?: string;
  provider?: string;
  type?: string;
  status?: string;
  search?: string;
  startDate?: number;
  endDate?: number;
  limit?: number;
  offset?: number;
  authUserId?: string;
}

/**
 * Response from getAITests query
 */
export interface AITestsResponse {
  tests: AITest[];
  total: number;
  hasMore: boolean;
}

/**
 * Statistics response from getAITestStats query
 */
export interface AITestStats {
  totalTests: number;
  totalIterations: number;
  totalCost: number;
  successRate: number;
  avgLatency: number;
  avgCostPerIteration: number;
  testsToday: number;
  testsThisWeek: number;
  testsThisMonth: number;
  modelCounts: Record<string, number>;
  providerCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  recentTests: AITest[];
}

/**
 * Token usage information for a test result
 */
export interface AITestUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reasoningTokens?: number;
  cachedInputTokens?: number;
}

/**
 * Error information for failed test results
 */
export interface TestResultError {
  message: string;
  type: string;
  code?: string;
  stack?: string;
  details?: any;
}

/**
 * Individual test result from a test iteration
 */
export interface AITestResult {
  id: string;
  iteration: number;
  status: 'completed' | 'failed';
  response?: string;
  usage: AITestUsage;
  cost: number;
  latencyMs: number;
  finishReason?: string;
  warnings: any[];
  firstTokenLatencyMs?: number;
  tokensPerSecond?: number;
  wordsPerMinute?: number;
  validationResults?: any;
  error?: TestResultError;
  logId?: string;
  executedAt: number;
}

/**
 * Summary statistics for a test
 */
export interface AITestSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  runningTests: number;
  avgLatency: number;
  totalCost: number;
  successRate: number;
  avgTokens?: number;
  avgCostPerToken?: number;
}

/**
 * Test status types
 */
export type AITestStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Test types
 */
export type AITestType =
  | 'text_generation'
  | 'object_generation'
  | 'embedding'
  | 'image_generation'
  | 'speech'
  | 'transcription'
  | 'streaming'
  | 'tool_calling'
  | 'caching'
  | 'multimodal'
  | 'error_handling';

/**
 * Data for updating an AI test
 */
export interface UpdateAITestData {
  status?: AITestStatus;
  results?: AITestResult[];
  summary?: AITestSummary;
  startedAt?: number;
  completedAt?: number;
  duration?: number;
  metadata?: any;
  [key: string]: any;
}
