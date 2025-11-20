// src/routes/api/ai/generate/text.ts

/**
 * API Route: Generate Text
 *
 * POST /api/ai/generate/text
 * Generates text using AI models with comprehensive validation and metadata tracking
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { AIGenerateRequest } from '@/features/boilerplate/ai-core/types';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { validateAIRequest } from '@/features/boilerplate/ai-core/utils';

interface TextGenerateRequest extends Omit<AIGenerateRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
  trace_id?: string;
  parent_request_id?: string;
}

export const Route = createFileRoute('/api/ai/generate/text')({
  server: {
    handlers: {
      POST: handleGenerateText,
    },
  },
})

async function handleGenerateText({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: TextGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as TextGenerateRequest;

    if (!generateRequest) {
      throw new Error('Invalid request body');
    }

    // Validate the request
    const validation = validateAIRequest({
      modelId: generateRequest.modelId,
      prompt: generateRequest.prompt,
      systemPrompt: generateRequest.systemPrompt,
      parameters: generateRequest.parameters
    });

    if (!validation.valid) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid request: ${validation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime,
          validation_errors: validation.errors
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIGenerateRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        traceId: generateRequest.trace_id,
        parentRequestId: generateRequest.parent_request_id,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'text_generation',
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   undefined
      }
    };

    // Generate text using the AI service
    const result = await aiService.generateText(aiRequest);

    const response: GatewayResponse<typeof result> = {
      data: result,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        provider: result.gatewayMetadata?.routing?.finalProvider,
        cached: result.cached || false
      }
    };

    return Response.json(response);
  } catch (error) {
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Text generation failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        model_id: generateRequest?.modelId
      }
    };

    return Response.json(response, { status: 500 });
  }
}
