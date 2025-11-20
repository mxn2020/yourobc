// src/routes/api/ai/test/execute.ts

/**
 * API Route: Execute AI Test
 *
 * POST /api/ai/test/execute - Execute an AI test configuration
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/system/auth/server';
import { AITestService } from '@/features/system/ai-core';
import type { TestConfiguration, TestResult } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { validateTestConfiguration } from '@/features/system/ai-core/utils';
import { Id } from '@/convex/_generated/dataModel';

interface ExecuteTestRequest {
  configuration: TestConfiguration;
  user_id?: string;
  session_id?: string;
  feature?: string;
  disable_caching?: boolean;
}

export const Route = createFileRoute('/api/ai/test/execute')({
  server: {
    handlers: {
      POST: handleExecuteTest,
    },
  },
})

async function handleExecuteTest({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let testRequest: ExecuteTestRequest | undefined;

  console.log(`[${requestId}] AI Test Execute API - Start processing request`);

  try {
    // Get authenticated session
    console.log(`[${requestId}] Getting authenticated session...`);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      console.log(`[${requestId}] Authentication failed - no user session`);
      return Response.json({
        data: null,
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    console.log(`[${requestId}] User authenticated:`, { userId: session.user.id });

    testRequest = await request.json() as ExecuteTestRequest;
    console.log(`[${requestId}] Request body parsed:`, {
      hasConfiguration: !!testRequest?.configuration,
      configId: testRequest?.configuration?.id,
      configType: testRequest?.configuration?.type,
      configName: testRequest?.configuration?.name
    });

    if (!testRequest || !testRequest.configuration) {
      console.log(`[${requestId}] Invalid request - missing configuration`);
      throw new Error('Invalid test configuration');
    }

    const { configuration } = testRequest;
    console.log(`[${requestId}] Test configuration:`, {
      id: configuration.id,
      name: configuration.name,
      type: configuration.type,
      modelId: configuration.modelId,
      iterations: configuration.iterations
    });

    // Validate test configuration
    console.log(`[${requestId}] Validating test configuration...`);
    const validation = validateTestConfiguration(configuration);
    if (!validation.valid) {
      console.log(`[${requestId}] Configuration validation failed:`, validation.errors);
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid test configuration: ${validation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime,
          validation_errors: validation.errors
        }
      };

      return Response.json(response, { status: 400 });
    }

    console.log(`[${requestId}] Configuration validation passed`);

    // Execute the test using AITestService
    console.log(`[${requestId}] Creating AITestService instance...`);
    const aiTestService = new AITestService();

    const testMetadata = {
      requestId,
      sessionId: testRequest.session_id || crypto.randomUUID(),
      feature: testRequest.feature || 'ai_testing',
      userAgent: request.headers.get('user-agent') || undefined,
      testRunStartTime: startTime, // Use timestamp instead of Date object
      disableCaching: testRequest.disable_caching || false
    };

    console.log(`[${requestId}] Executing test with metadata:`, testMetadata);
    console.log(`[${requestId}] Calling aiTestService.executeTest...`);
    const testResult = await aiTestService.executeTest(
      configuration,
      testMetadata
    );

    console.log(`[${requestId}] Test execution completed successfully:`, {
      resultId: testResult.id,
      status: testResult.status,
      cost: testResult.cost,
      latencyMs: testResult.latencyMs
    });

    const response: GatewayResponse<TestResult> = {
      data: testResult,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        test_type: configuration.type,
        model_id: configuration.modelId
      }
    };

    console.log(`[${requestId}] Sending successful response:`, {
      processingTimeMs: Date.now() - startTime,
      testStatus: testResult.status
    });
    return Response.json(response);
  } catch (error) {
    console.error(`[${requestId}] Test execution failed:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      testConfigId: testRequest?.configuration?.id,
      userId: testRequest ? 'present' : 'missing'
    });

    // Extract enhanced error details if available
    const errorDetails = error && typeof error === 'object' && 'details' in error ? error.details : undefined;

    // Type guard for error details
    const hasErrorDetails = (details: unknown): details is {
      originalError?: { message?: string };
      provider?: string;
      operation?: string;
      timestamp?: string | number;
    } => {
      return details !== null && typeof details === 'object';
    };
    const errorMessage = error instanceof Error ? error.message : 'Test execution failed';

    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: errorMessage,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        test_config_id: testRequest?.configuration?.id,
        // Include enhanced error details for frontend
        error_details: (errorDetails && hasErrorDetails(errorDetails)) ? {
          originalMessage: errorDetails.originalError?.message,
          provider: errorDetails.provider,
          operation: errorDetails.operation,
          technicalDetails: errorDetails.originalError?.message || errorMessage,
          timestamp: errorDetails.timestamp
        } : undefined
      }
    };

    return Response.json(response, { status: 500 });
  }
}
