// src/routes/api/ai/generate/object.ts

/**
 * API Route: Generate Structured Object
 *
 * POST /api/ai/generate/object
 * Generates structured objects using AI models with JSON schema validation
 */

import { createFileRoute } from '@tanstack/react-router'
import { aiService } from '@/features/system/ai-core';
import type { AIObjectRequest } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { validateAIRequest, validateJsonSchema } from '@/features/system/ai-core/utils';

interface ObjectGenerateRequest extends Omit<AIObjectRequest, 'metadata'> {
  user_id?: string;
  session_id?: string;
  feature?: string;
  trace_id?: string;
  parent_request_id?: string;
}

export const Route = createFileRoute('/api/ai/generate/object')({
  server: {
    handlers: {
      POST: handleGenerateObject,
    },
  },
})

async function handleGenerateObject({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let generateRequest: ObjectGenerateRequest | undefined;

  try {
    generateRequest = await request.json() as ObjectGenerateRequest;

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
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid request: ${requestValidation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime,
          validation_errors: requestValidation.errors
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Validate JSON schema
    const schemaValidation = validateJsonSchema(generateRequest.schema);
    if (!schemaValidation.valid) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid schema: ${schemaValidation.errors.join(', ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime,
          validation_errors: schemaValidation.errors
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Build the AI request with metadata
    const aiRequest: AIObjectRequest = {
      ...generateRequest,
      metadata: {
        requestId,
        traceId: generateRequest.trace_id,
        parentRequestId: generateRequest.parent_request_id,
        sessionId: generateRequest.session_id,
        feature: generateRequest.feature || 'object_generation',
        userAgent: request.headers.get('user-agent') || undefined,
        objectType: generateRequest.outputMode || 'object'
      }
    };

    // Generate object using the AI service
    const result = await aiService.generateObject(aiRequest);

    const response: GatewayResponse<typeof result> = {
      data: result,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        cached: false
      }
    };

    return Response.json(response);
  } catch (error) {
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Object generation failed',
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
