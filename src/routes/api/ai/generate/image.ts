// src/routes/api/ai/generate/image.ts

/**
 * API Route: Generate Image
 *
 * POST /api/ai/generate/image
 * Generates images using AI models with comprehensive validation and metadata tracking
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/system/ai-core';
import type { AIImageRequest } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { validateAIRequest } from '@/features/system/ai-core/utils';

interface ImageGenerateRequest extends Omit<AIImageRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
  trace_id?: string;
  parent_request_id?: string;
}

export const Route = createFileRoute('/api/ai/generate/image')({
  server: {
    handlers: {
      POST: handleGenerateImage,
    },
  },
})

async function handleGenerateImage({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: ImageGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as ImageGenerateRequest;

    if (!generateRequest) {
      throw new Error('Invalid request body');
    }

    // Validate the request
    const validation = validateAIRequest({
      modelId: generateRequest.modelId,
      prompt: generateRequest.prompt
    });

    if (!validation.valid) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid request: ${validation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIImageRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        traceId: generateRequest.trace_id,
        parentRequestId: generateRequest.parent_request_id,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'image_generation',
        userAgent: request.headers.get('user-agent') || undefined
      }
    };

    // Generate image using the AI service
    const result = await aiService.generateImage(aiRequest);

    const response: GatewayResponse<typeof result> = {
      data: result,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response);
  } catch (error) {
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Image generation failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
