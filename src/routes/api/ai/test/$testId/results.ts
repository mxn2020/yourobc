// src/routes/api/ai/test/$testId/results.ts

/**
 * API Route: AI Test Results
 *
 * GET /api/ai/test/$testId/results - Get test results
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/boilerplate/auth/server';
import { AITestService } from '@/features/boilerplate/ai-core';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { Id } from '@/convex/_generated/dataModel';

export const Route = createFileRoute('/api/ai/test/$testId/results')({
  server: {
    handlers: {
      GET: handleGetTestResults,
    },
  },
})

async function handleGetTestResults({ request, params }: { request: Request; params: { testId: Id<"aiTests"> } }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { testId } = params;

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

    // Get test results from aiTests table
    const aiTestService = new AITestService();
    const results = await aiTestService.getTest(testId);

    if (!results) {
      return Response.json({
        data: null,
        success: false,
        error: 'Test not found'
      }, { status: 404 });
    }

    const response: GatewayResponse<typeof results.results> = {
      data: results.results,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        total_results: results.results.length
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching test results:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch test results',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}