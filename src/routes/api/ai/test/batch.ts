// src/routes/api/ai/test/batch.ts

/**
 * API Route: Batch AI Test Execution
 *
 * POST /api/ai/test/batch - Execute multiple AI tests in batch
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/boilerplate/auth/server';
import { AITestService } from '@/features/boilerplate/ai-core';
import type { TestConfiguration, TestResult } from '@/features/boilerplate/ai-core/types';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { validateTestConfiguration } from '@/features/boilerplate/ai-core/utils';
import { Id } from '@/convex/_generated/dataModel';

interface BatchTestRequest {
  configurations: TestConfiguration[];
  concurrent_limit?: number;
  user_id?: string;
  session_id?: string;
}

export const Route = createFileRoute('/api/ai/test/batch')({
  server: {
    handlers: {
      POST: handleBatchTests,
    },
  },
})

async function handleBatchTests({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let batchRequest: BatchTestRequest | undefined;

  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({
        data: null,
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    batchRequest = await request.json() as BatchTestRequest;

    if (!batchRequest || !Array.isArray(batchRequest.configurations)) {
      throw new Error('Invalid batch test request');
    }

    const { configurations, concurrent_limit = 5 } = batchRequest;

    // Validate all configurations
    const validationResults = configurations.map(config => ({
      config,
      validation: validateTestConfiguration(config)
    }));

    const invalidConfigs = validationResults.filter(result => !result.validation.valid);
    if (invalidConfigs.length > 0) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid configurations: ${invalidConfigs.map(c => c.validation.errors.join(', ')).join('; ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime,
          invalid_config_count: invalidConfigs.length
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Execute batch tests
    const aiTestService = new AITestService();
    const results = await aiTestService.executeBatchTests({
      configurations,
      concurrentLimit: concurrent_limit,
      metadata: {
        requestId,
        sessionId: batchRequest.session_id,
        userAgent: request.headers.get('user-agent') || undefined,
        testRunStartTime: Date.now()
      }
    });

    const response: GatewayResponse<TestResult[]> = {
      data: results,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        total_tests: configurations.length,
        successful_tests: results.filter(r => r.status === 'completed').length,
        failed_tests: results.filter(r => r.status === 'failed').length
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error executing batch tests:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Batch test execution failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        total_configs: batchRequest?.configurations?.length || 0
      }
    };

    return Response.json(response, { status: 500 });
  }
}
