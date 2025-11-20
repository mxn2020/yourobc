// src/routes/api/ai/generate/embedding.ts

/**
 * API Route: Generate Embeddings
 *
 * POST /api/ai/generate/embedding
 * Generates vector embeddings from text using AI models
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { AIEmbeddingRequest } from '@/features/boilerplate/ai-core/types';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { validateModelId } from '@/features/boilerplate/ai-core/utils';

interface EmbeddingGenerateRequest extends Omit<AIEmbeddingRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
}

export const Route = createFileRoute('/api/ai/generate/embedding')({
  server: {
    handlers: {
      POST: handleGenerateEmbedding,
    },
  },
})

async function handleGenerateEmbedding({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: EmbeddingGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as EmbeddingGenerateRequest;

    if (!generateRequest) {
      throw new Error('Invalid request body');
    }

    // Validate model ID
    const modelValidation = validateModelId(generateRequest.modelId);
    if (!modelValidation.valid) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid model ID: ${modelValidation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Validate text input
    if (!generateRequest.text || (Array.isArray(generateRequest.text) && generateRequest.text.length === 0)) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: 'Text input is required for embedding generation',
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIEmbeddingRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'embedding_generation',
        userAgent: request.headers.get('user-agent') || undefined
      }
    };

    // Generate embedding using the AI service
    const result = await aiService.generateEmbedding(aiRequest);

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
      error: error instanceof Error ? error.message : 'Embedding generation failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
