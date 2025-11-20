// src/routes/api/ai/generate/stream.ts

/**
 * API Route: Generate Text Stream
 *
 * POST /api/ai/generate/stream
 * Generates streaming text responses using AI models with Server-Sent Events
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/system/ai-core';
import type { AIGenerateRequest } from '@/features/system/ai-core/types';
import { validateAIRequest } from '@/features/system/ai-core/utils';

interface StreamGenerateRequest extends Omit<AIGenerateRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
  trace_id?: string;
  parent_request_id?: string;
}

export const Route = createFileRoute('/api/ai/generate/stream')({
  server: {
    handlers: {
      POST: handleGenerateStream,
    },
  },
})

async function handleGenerateStream({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: StreamGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as StreamGenerateRequest;

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
      return Response.json({
        success: false,
        error: `Invalid request: ${validation.errors.join(', ')}`
      }, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIGenerateRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        traceId: generateRequest.trace_id,
        parentRequestId: generateRequest.parent_request_id,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'streaming',
        userAgent: request.headers.get('user-agent') || undefined
      }
    };

    // Get the streaming response
    const stream = await aiService.generateTextStream(aiRequest);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Streaming failed',
      request_id: requestId
    }, { status: 500 });
  }
}
