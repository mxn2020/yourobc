// src/routes/api/ai/test/$testId/index.ts

/**
 * API Route: AI Test Management
 *
 * GET /api/ai/test/$testId - Get test details
 * DELETE /api/ai/test/$testId - Delete a test
 */

import { createFileRoute } from '@tanstack/react-router'
import { auth } from '@/features/system/auth/server';
import { AITestService } from '@/features/system/ai-core';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { Id } from '@/convex/_generated/dataModel';

export const Route = createFileRoute('/api/ai/test/$testId/')({
  server: {
    handlers: {
      GET: handleGetTest,
      DELETE: handleDeleteTest,
    },
  },
})

async function handleGetTest({ request, params }: { request: Request; params: { testId: string } }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { testId: rawTestId } = params;
  const publicId = decodeURIComponent(rawTestId);

  console.log('🔍 [AI Test API] Get test request:', {
    requestId,
    rawTestId,
    decodedPublicId: publicId,
    url: request.url,
  });

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

    // Get test details by public ID (not Convex _id)
    const aiTestService = new AITestService();
    const testDetails = await aiTestService.getTestByPublicId(publicId);

    if (!testDetails) {
      return Response.json({
        data: null,
        success: false,
        error: `Test ${publicId} not found`
      }, { status: 404 });
    }

    // Transform to expected format (use publicId for id field)
    const transformedTest = {
      id: testDetails.publicId,  // Use publicId instead of _id
      name: testDetails.name,
      description: testDetails.description,
      type: testDetails.type,
      modelId: testDetails.modelId,
      provider: testDetails.provider,
      status: testDetails.status,
      parameters: testDetails.parameters,
      results: testDetails.results,
      summary: testDetails.summary,
      metadata: testDetails.metadata,
      createdAt: new Date(testDetails.createdAt),
      startedAt: testDetails.startedAt ? new Date(testDetails.startedAt) : undefined,
      completedAt: testDetails.completedAt ? new Date(testDetails.completedAt) : undefined,
      duration: testDetails.duration
    };

    const response: GatewayResponse<typeof transformedTest> = {
      data: transformedTest,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching test details:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch test details',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}

async function handleDeleteTest({ request, params }: { request: Request; params: { testId: string } }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { testId: rawTestId } = params;
  const publicId = decodeURIComponent(rawTestId);

  console.log('🗑️ [AI Test API] Delete test request:', {
    requestId,
    rawTestId,
    decodedPublicId: publicId,
  });

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

    // Delete test by public ID (not Convex _id)
    const aiTestService = new AITestService();
    await aiTestService.deleteTestByPublicId(publicId);

    const response: GatewayResponse<{ deleted: boolean }> = {
      data: { deleted: true },
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error deleting test:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete test',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}

