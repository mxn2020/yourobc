// src/routes/api/ai/test/history.ts

/**
 * API Route: AI Test History
 *
 * GET /api/ai/test/history - Get test history with filters
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/boilerplate/auth/server';
import { AITestService } from '@/features/boilerplate/ai-core';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import type { TestStatus } from '@/features/boilerplate/ai-core/types';
import { Id } from '@/convex/_generated/dataModel';

export const Route = createFileRoute('/api/ai/test/history')({
  server: {
    handlers: {
      GET: handleGetTestHistory,
    },
  },
})

async function handleGetTestHistory({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

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

    const url = new URL(request.url);
    const modelId = url.searchParams.get('model_id');
    const testType = url.searchParams.get('test_type');
    const provider = url.searchParams.get('provider');
    const statusParam = url.searchParams.get('status');
    const status: TestStatus | undefined = (statusParam && ['pending', 'running', 'completed', 'failed', 'cancelled'].includes(statusParam))
      ? statusParam as TestStatus
      : undefined;
    const search = url.searchParams.get('search');
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : 50;
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : 0;

    // Parse date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (url.searchParams.get('start_date')) {
      startDate = new Date(url.searchParams.get('start_date')!);
    }

    if (url.searchParams.get('end_date')) {
      endDate = new Date(url.searchParams.get('end_date')!);
    }

    // Get test history from aiTests table using AITestService
    const aiTestService = new AITestService();
    const testHistory = await aiTestService.getTests({
      modelId: modelId || undefined,
      type: testType || undefined,
      provider: provider || undefined,
      status,
      search: search || undefined,
      startDate,
      endDate,
      limit,
      offset
    });

    // Transform the tests into the expected test history format
    const transformedHistory = testHistory.tests.map(test => ({
      id: test.publicId,  // Use publicId instead of _id
      name: test.name,
      type: test.type,
      modelId: test.modelId,
      provider: test.provider,
      status: test.status,
      summary: {
        totalTests: test.summary.totalTests,
        passedTests: test.summary.passedTests,
        failedTests: test.summary.failedTests,
        runningTests: test.summary.runningTests,
        avgLatency: test.summary.avgLatency,
        totalCost: test.summary.totalCost,
        successRate: test.summary.successRate
      },
      duration: test.duration,
      createdAt: new Date(test.createdAt),
      completedAt: test.completedAt ? new Date(test.completedAt) : undefined,
      cost: test.summary.totalCost
    }));

    const response: GatewayResponse<typeof transformedHistory> = {
      data: transformedHistory,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        total: testHistory.total,
        hasMore: testHistory.hasMore,
        filters_applied: [modelId, testType, provider, status, search].filter(Boolean).length
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching test history:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch test history',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}