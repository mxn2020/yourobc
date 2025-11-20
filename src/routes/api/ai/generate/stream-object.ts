// src/routes/api/ai/generate/stream-object.ts

/**
 * API Route: Generate Structured Object Stream
 *
 * POST /api/ai/generate/stream-object
 * Generates streaming structured objects using AI models with JSON schema validation
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/boilerplate/ai-core';
import type { AIObjectRequest } from '@/features/boilerplate/ai-core/types';
import { validateAIRequest, validateJsonSchema } from '@/features/boilerplate/ai-core/utils';

interface StreamObjectRequest extends Omit<AIObjectRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
  trace_id?: string;
  parent_request_id?: string;
}

export const Route = createFileRoute('/api/ai/generate/stream-object')({
  server: {
    handlers: {
      POST: handleGenerateStreamObject,
    },
  },
})

async function handleGenerateStreamObject({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: StreamObjectRequest | undefined;

  try {
    generateRequest = await request.json() as StreamObjectRequest;

    if (!generateRequest) {
      throw new Error('Invalid request body');
    }

    // Validate the request
    const requestValidation = validateAIRequest({
      modelId: generateRequest.modelId,
      prompt: generateRequest.prompt,
      systemPrompt: generateRequest.systemPrompt,
      parameters: generateRequest.parameters,
      schema: generateRequest.schema
    });

    if (!requestValidation.valid) {
      return Response.json({
        success: false,
        error: `Invalid request: ${requestValidation.errors.join(', ')}`
      }, { status: 400 });
    }

    // Validate JSON schema
    const schemaValidation = validateJsonSchema(generateRequest.schema);
    if (!schemaValidation.valid) {
      return Response.json({
        success: false,
        error: `Invalid schema: ${schemaValidation.errors.join(', ')}`
      }, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIObjectRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        traceId: generateRequest.trace_id,
        parentRequestId: generateRequest.parent_request_id,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'object_streaming',
        userAgent: request.headers.get('user-agent') || undefined,
        objectType: generateRequest.outputMode || 'object'
      }
    };

    // Get the streaming response
    const stream = await aiService.generateObjectStream(aiRequest);

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
      error: error instanceof Error ? error.message : 'Object streaming failed',
      request_id: requestId
    }, { status: 500 });
  }
}
