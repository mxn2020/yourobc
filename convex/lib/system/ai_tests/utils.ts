// convex/lib/boilerplate/ai_tests/utils.ts

import { AITestResult, AITestSummary } from './types';
import { AI_TESTS_CONSTANTS } from './constants';

/**
 * Calculate time period start timestamps
 */
export function getTimePeriodStarts() {
  const now = Date.now();
  const dayStart = now - AI_TESTS_CONSTANTS.TIME_PERIODS.DAY_MS;
  const weekStart = now - AI_TESTS_CONSTANTS.TIME_PERIODS.WEEK_MS;
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime();

  return { now, dayStart, weekStart, monthStart };
}

/**
 * Check if a test matches search criteria
 */
export function matchesTestSearch(
  test: {
    name: string;
    modelId: string;
    provider: string;
    description?: string;
  },
  search: string
): boolean {
  const searchLower = search.toLowerCase();
  return (
    test.name.toLowerCase().includes(searchLower) ||
    test.modelId.toLowerCase().includes(searchLower) ||
    test.provider.toLowerCase().includes(searchLower) ||
    (!!test.description && test.description.toLowerCase().includes(searchLower))
  );
}

/**
 * Calculate summary statistics from test results
 */
export function calculateTestSummary(results: AITestResult[]): AITestSummary {
  const totalTests = results.length;
  const passedTests = results.filter((r) => r.status === 'completed').length;
  const failedTests = results.filter((r) => r.status === 'failed').length;
  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  const totalLatency = results.reduce((sum, r) => sum + r.latencyMs, 0);
  const avgLatency = totalTests > 0 ? totalLatency / totalTests : 0;
  const successRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;
  const totalTokens = results.reduce((sum, r) => sum + r.usage.totalTokens, 0);
  const avgTokens = totalTests > 0 ? totalTokens / totalTests : 0;
  const avgCostPerToken =
    totalCost > 0 && avgTokens > 0 ? totalCost / (avgTokens * totalTests) : 0;

  return {
    totalTests,
    passedTests,
    failedTests,
    runningTests: 0,
    avgLatency,
    totalCost,
    successRate,
    avgTokens,
    avgCostPerToken,
  };
}

/**
 * Get default test summary object
 */
export function getDefaultTestSummary(): AITestSummary {
  return {
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    runningTests: 0,
    avgLatency: 0,
    totalCost: 0,
    successRate: 0,
  };
}

/**
 * Validate test data before creation
 */
export function validateTestData(data: {
  name: string;
  modelId: string;
  provider: string;
  type: string;
}): string[] {
  const errors: string[] = [];

  if (!data.name || data.name.trim() === '') {
    errors.push('Test name is required');
  }

  if (!data.modelId || data.modelId.trim() === '') {
    errors.push('Model ID is required');
  }

  if (!data.provider || data.provider.trim() === '') {
    errors.push('Provider is required');
  }

  if (!data.type || data.type.trim() === '') {
    errors.push('Test type is required');
  }

  return errors;
}

/**
 * Group tests by a specific field
 */
export function groupTestsByField<T extends Record<string, any>>(
  tests: T[],
  field: keyof T
): Record<string, number> {
  return tests.reduce((acc: Record<string, number>, test) => {
    const key = String(test[field]);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Calculate average value from array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Sanitize search string for querying
 */
export function sanitizeSearchString(search: string | undefined): string | undefined {
  if (!search) return undefined;
  return search.trim().toLowerCase();
}
