// src/routes/api/ai/models/$modelId.ts

/**
 * API Route: Get AI Model by ID
 *
 * GET /api/ai/models/:modelId
 * Fetches a specific AI model by its ID
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';

export const Route = createFileRoute('/api/ai/models/$modelId')({
  server: {
    handlers: {
      GET: handleGetModel,
    },
  },
})

async function handleGetModel({ request, params }: { request: Request; params: { modelId: string } }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  const { modelId: rawModelId } = params;
  const modelId = decodeURIComponent(rawModelId);

  try {
    const model = await aiService.getModel(modelId);

    if (!model) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Model ${modelId} not found`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 404 });
    }

    const response: GatewayResponse<typeof model> = {
      data: model,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        cached: true
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching model:', error);

    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch model',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
