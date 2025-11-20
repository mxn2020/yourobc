// src/routes/api/ai/generate/transcription.ts

/**
 * API Route: Generate Transcription
 *
 * POST /api/ai/generate/transcription
 * Transcribes audio to text using AI speech-to-text models
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/system/ai-core';
import type { AITranscriptionRequest } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { validateModelId } from '@/features/system/ai-core/utils';

interface TranscriptionRequest extends Omit<AITranscriptionRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
}

export const Route = createFileRoute('/api/ai/generate/transcription')({
  server: {
    handlers: {
      POST: handleGenerateTranscription,
    },
  },
})

async function handleGenerateTranscription({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let transcriptionRequest: TranscriptionRequest | undefined;

  try {
    transcriptionRequest = await request.json() as TranscriptionRequest;

    if (!transcriptionRequest) {
      throw new Error('Invalid request body');
    }

    // Validate model ID and audio
    const modelValidation = validateModelId(transcriptionRequest.modelId);
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

    if (!transcriptionRequest.audio || transcriptionRequest.audio.trim().length === 0) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: 'Audio data is required for transcription',
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AITranscriptionRequest = {
      ...transcriptionRequest,
      metadata: {
        requestId,
        sessionId: transcriptionRequest.session_id,
        feature: transcriptionRequest.feature || 'transcription',
        userAgent: request.headers.get('user-agent') || undefined
      }
    };

    // Transcribe audio using the AI service
    const result = await aiService.transcribeAudio(aiRequest);

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
      error: error instanceof Error ? error.message : 'Transcription failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
