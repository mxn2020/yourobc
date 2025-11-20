// src/routes/api/ai/test/analytics.ts

/**
 * API Route: AI Test Analytics
 *
 * GET /api/ai/test/analytics - Get test analytics and metrics
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/boilerplate/auth/server';
import { AITestService } from '@/features/boilerplate/ai-core';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';

export const Route = createFileRoute('/api/ai/test/analytics')({
  server: {
    handlers: {
      GET: handleGetTestAnalytics,
    },
  },
})

async function handleGetTestAnalytics({ request }: { request: Request }) {
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

    // Get test analytics from aiTests table using AITestService
    // Note: Backend automatically fetches analytics for current user via JWT token
    const aiTestService = new AITestService();
    const analytics = await aiTestService.getTestAnalytics();

    // Transform analytics to match expected format
    const transformedAnalytics = {
      testsOverTime: [] as Array<{ date: string; count: number; successRate: number }>,
      modelPerformance: Object.entries(analytics.modelCounts).map(([modelId, count]) => ({
        modelId,
        provider: modelId.split('/')[0],
        testCount: count,
        successRate: 100, // Would need to calculate from test results
        avgLatency: analytics.avgLatency || 0,
        avgCost: analytics.avgCostPerIteration || 0
      })),
      costTrends: [] as Array<{ date: string; totalCost: number }>
    };

    // Calculate tests over time from recent tests
    if (analytics.recentTests && analytics.recentTests.length > 0) {
      const testsByDate = new Map<string, { count: number, successCount: number }>();

      analytics.recentTests.forEach(test => {
        const dateKey = new Date(test.createdAt).toISOString().split('T')[0];
        const current = testsByDate.get(dateKey) || { count: 0, successCount: 0 };
        current.count += test.summary.totalTests;
        current.successCount += test.summary.passedTests;
        testsByDate.set(dateKey, current);
      });

      transformedAnalytics.testsOverTime = Array.from(testsByDate.entries())
        .map(([date, stats]) => ({
          date,
          count: stats.count,
          successRate: stats.count > 0 ? (stats.successCount / stats.count) * 100 : 0
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days
    }

    // Calculate cost trends from recent tests
    if (analytics.recentTests && analytics.recentTests.length > 0) {
      const costsByDate = new Map<string, number>();

      analytics.recentTests.forEach(test => {
        if (test.completedAt) {
          const dateKey = new Date(test.completedAt).toISOString().split('T')[0];
          const current = costsByDate.get(dateKey) || 0;
          costsByDate.set(dateKey, current + test.summary.totalCost);
        }
      });

      transformedAnalytics.costTrends = Array.from(costsByDate.entries())
        .map(([date, totalCost]) => ({
          date,
          totalCost
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(-7); // Last 7 days
    }

    const response: GatewayResponse<typeof transformedAnalytics> = {
      data: transformedAnalytics,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        user_id: session.user.id,
        total_tests: analytics.totalTests,
        total_iterations: analytics.totalIterations
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching test analytics:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch test analytics',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
