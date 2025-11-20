// src/routes/api/ai/generate/speech.ts

/**
 * API Route: Generate Speech
 *
 * POST /api/ai/generate/speech
 * Generates speech audio from text using AI text-to-speech models
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { AISpeechRequest } from '@/features/boilerplate/ai-core/types';
import type { GatewayResponse } from '@/features/boilerplate/ai-core/types';
import { validateModelId } from '@/features/boilerplate/ai-core/utils';

interface SpeechGenerateRequest extends Omit<AISpeechRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
}

export const Route = createFileRoute('/api/ai/generate/speech')({
  server: {
    handlers: {
      POST: handleGenerateSpeech,
    },
  },
})

async function handleGenerateSpeech({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: SpeechGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as SpeechGenerateRequest;

    if (!generateRequest) {
      throw new Error('Invalid request body');
    }

    // Validate model ID and text
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

    if (!generateRequest.text || generateRequest.text.trim().length === 0) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: 'Text is required for speech generation',
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AISpeechRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'speech_generation',
        userAgent: request.headers.get('user-agent') || undefined
      }
    };

    // Generate speech using the AI service
    const result = await aiService.generateSpeech(aiRequest);

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
      error: error instanceof Error ? error.message : 'Speech generation failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
