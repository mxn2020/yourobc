// convex/lib/boilerplate/ai_logs/utils.ts

import { AIMetadata, AIParameters, AIUsage } from './types';
import { AI_LOGS_CONSTANTS } from './constants';

/**
 * Get default AI parameters
 */
export function getDefaultParameters(): AIParameters {
  return {
    temperature: 1.0,
    maxTokens: 4096,
    topP: 1.0,
  };
}

/**
 * Get default usage object
 */
export function getDefaultUsage(): AIUsage {
  return {
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
  };
}

/**
 * Get default metadata object
 */
export function getDefaultMetadata(requestId: string): AIMetadata {
  return {
    requestId,
    cacheHit: false,
    rateLimited: false,
  };
}

/**
 * Calculate time period start timestamps
 */
export function getTimePeriodStarts() {
  const now = Date.now();
  const dayStart = now - AI_LOGS_CONSTANTS.TIME_PERIODS.DAY_MS;
  const weekStart = now - AI_LOGS_CONSTANTS.TIME_PERIODS.WEEK_MS;
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  ).getTime();

  return { now, dayStart, weekStart, monthStart };
}

/**
 * Sanitize search string for querying
 */
export function sanitizeSearchString(search: string | undefined): string | undefined {
  if (!search) return undefined;
  return search.trim().toLowerCase();
}

/**
 * Validate AI log data before creation
 */
export function validateAILogData(data: {
  modelId: string;
  provider: string;
  prompt: string;
}): string[] {
  const errors: string[] = [];

  if (!data.modelId || data.modelId.trim() === '') {
    errors.push('Model ID is required');
  }

  if (!data.provider || data.provider.trim() === '') {
    errors.push('Provider is required');
  }

  if (!data.prompt || data.prompt.trim() === '') {
    errors.push('Prompt is required');
  }

  return errors;
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
 * Group logs by a specific field
 */
export function groupLogsByField<T extends Record<string, any>>(
  logs: T[],
  field: keyof T
): Record<string, number> {
  return logs.reduce((acc: Record<string, number>, log) => {
    const key = String(log[field]);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

/**
 * Check if a log matches search criteria
 */
export function matchesSearch(
  log: {
    prompt: string;
    modelId: string;
    provider: string;
    response?: string;
  },
  search: string
): boolean {
  const searchLower = search.toLowerCase();
  return (
    log.prompt.toLowerCase().includes(searchLower) ||
    log.modelId.toLowerCase().includes(searchLower) ||
    log.provider.toLowerCase().includes(searchLower) ||
    (!!log.response && log.response.toLowerCase().includes(searchLower))
  );
}
