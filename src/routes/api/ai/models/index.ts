// src/routes/api/ai/models/index.ts

/**
 * API Route: Get AI Models
 *
 * GET /api/ai/models
 * Fetches available AI models with optional filtering and sorting
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { ModelFilter, ModelSort } from '@/features/boilerplate/ai-core/types';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { parseModelFilters, parseModelSort } from '@/features/boilerplate/ai-core/utils';

export const Route = createFileRoute('/api/ai/models/')({
  server: {
    handlers: {
      GET: handleGetModels,
    },
  },
})

async function handleGetModels({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    const url = new URL(request.url);
    const filters: ModelFilter = parseModelFilters(url.searchParams);
    const sort: ModelSort = parseModelSort(url.searchParams);
    const forceRefresh = url.searchParams.get('force_refresh') === 'true';
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    const models = await aiService.getModels({
      filters,
      sort,
      limit,
      forceRefresh
    });

    const response: GatewayResponse<typeof models> = {
      data: models,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        cached: !forceRefresh,
        total_results: models.length
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching models:', error);

    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch models',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
