// src/utils/ai/test-utils.ts

import type { TestParameters } from '@/features/system/ai-core/types';

/**
 * Clean test parameters by removing internal fields that shouldn't be stored in database
 */
export function cleanTestParameters(parameters: TestParameters): TestParameters {
  if (!parameters || typeof parameters !== 'object') {
    return parameters;
  }

  const cleaned = { ...parameters };
  
  // Remove internal fields that start with underscore and test-specific fields
  // These are used for cache-busting and testing but shouldn't be persisted
  const internalFields = ['_testId', '_testTimestamp', '_requestId', '_sessionId', 'maxRetries'];
  
  internalFields.forEach(field => {
    if (field in cleaned) {
      delete (cleaned)[field];
    }
  });

  // Also remove any field that starts with underscore
  Object.keys(cleaned).forEach(key => {
    if (key.startsWith('_')) {
      delete (cleaned)[key];
    }
  });

  return cleaned;
}

/**
 * Add internal fields to parameters for API requests (but not database storage)
 */
export function addInternalFields(
  parameters: TestParameters,
  options?: {
    testId?: string;
    timestamp?: number;
    requestId?: string;
    sessionId?: string;
  }
): TestParameters {
  return {
    ...parameters,
    _testTimestamp: options?.timestamp || Date.now(),
    _testId: options?.testId || crypto.randomUUID(),
    ...(options?.requestId && { _requestId: options.requestId }),
    ...(options?.sessionId && { _sessionId: options.sessionId })
  };
}

