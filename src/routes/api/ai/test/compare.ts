// src/routes/api/ai/test/compare.ts

/**
 * API Route: Compare AI Models
 *
 * POST /api/ai/test/compare - Compare multiple AI models with the same test configuration
 */

import { createFileRoute } from '@tanstack/react-router'
import { AITestService } from '@/features/system/ai-core';
import { auth } from '@/features/system/auth/server';
import type { TestConfiguration, TestResult } from '@/features/system/ai-core/types';
import type { GatewayResponse } from '@/features/system/ai-core/types';
import { validateTestConfiguration } from '@/features/system/ai-core/utils';
import { Id } from '@/convex/_generated/dataModel';

interface CompareTestRequest {
  models: string[];
  test_configuration: Omit<TestConfiguration, 'modelId'>;
  user_id?: string;
  session_id?: string;
}

interface MetricResult {
  model: string;
  value: number;
}

interface CompareTestResponse {
  results: TestResult[];
  comparison: {
    winner?: string;
    metrics: {
      cost: MetricResult[];
      latency: MetricResult[];
      quality: MetricResult[];
    };
    recommendations: string[];
  };
}

export const Route = createFileRoute('/api/ai/test/compare')({
  server: {
    handlers: {
      POST: handleCompareModels,
    },
  },
})

async function handleCompareModels({ request }: { request: Request }) {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();
  let compareRequest: CompareTestRequest | undefined;

  try {
    // Get authenticated session
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return Response.json({
        data: null,
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    compareRequest = await request.json() as CompareTestRequest;

    if (!compareRequest || !Array.isArray(compareRequest.models) || compareRequest.models.length < 2) {
      throw new Error('At least 2 models are required for comparison');
    }

    if (compareRequest.models.length > 5) {
      throw new Error('Maximum 5 models allowed for comparison');
    }

    // Create test configurations for each model
    const configurations: TestConfiguration[] = compareRequest!.models.map(modelId => ({
      ...compareRequest!.test_configuration,
      id: `${compareRequest!.test_configuration.id}-${modelId}`,
      modelId,
      name: `${compareRequest!.test_configuration.name} - ${modelId}`
    }));

    // Validate all configurations
    const validationResults = configurations.map(config => ({
      config,
      validation: validateTestConfiguration(config)
    }));

    const invalidConfigs = validationResults.filter(result => !result.validation.valid);
    if (invalidConfigs.length > 0) {
      const response: GatewayResponse<null> = {
        data: null,
        success: false,
        error: `Invalid configurations: ${invalidConfigs.map(c => c.validation.errors.join(', ')).join('; ')}`,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTimeMs: Date.now() - startTime
        }
      };

      return Response.json(response, { status: 400 });
    }

    // Execute comparison tests
    const aiTestService = new AITestService();
    const results = await aiTestService.executeBatchTests({
      configurations,
      concurrentLimit: 3,
      metadata: {
        requestId,
        sessionId: compareRequest.session_id,
        userAgent: request.headers.get('user-agent') || undefined,
        testRunStartTime: Date.now()
      }
    });

    // Analyze results for comparison
    const successfulResults = results.filter(r => r.status === 'completed');

    const costMetrics: MetricResult[] = successfulResults.map(r => ({
      model: r.modelId,
      value: r.cost || 0
    })).sort((a, b) => a.value - b.value);

    const latencyMetrics: MetricResult[] = successfulResults.map(r => ({
      model: r.modelId,
      value: r.latencyMs || 0
    })).sort((a, b) => a.value - b.value);

    // Simple quality scoring based on successful completion and token efficiency
    const qualityMetrics: MetricResult[] = successfulResults.map(r => ({
      model: r.modelId,
      value: r.validationResults?.score || (r.status === 'completed' ? 0.8 : 0)
    })).sort((a, b) => b.value - a.value);

    // Determine winner (best overall balance)
    const winner = successfulResults.length > 0
      ? successfulResults.reduce((best, current) => {
          const bestScore = (best.validationResults?.score || 0.5) / (best.cost || 1) / (best.latencyMs || 1000);
          const currentScore = (current.validationResults?.score || 0.5) / (current.cost || 1) / (current.latencyMs || 1000);
          return currentScore > bestScore ? current : best;
        }).modelId
      : undefined;

    const recommendations = [];
    if (costMetrics.length > 0) {
      recommendations.push(`Most cost-effective: ${costMetrics[0].model} ($${costMetrics[0].value.toFixed(4)})`);
    }
    if (latencyMetrics.length > 0) {
      recommendations.push(`Fastest response: ${latencyMetrics[0].model} (${latencyMetrics[0].value}ms)`);
    }
    if (qualityMetrics.length > 0) {
      recommendations.push(`Highest quality: ${qualityMetrics[0].model} (score: ${qualityMetrics[0].value})`);
    }

    const compareResponse: CompareTestResponse = {
      results,
      comparison: {
        winner,
        metrics: {
          cost: costMetrics,
          latency: latencyMetrics,
          quality: qualityMetrics
        },
        recommendations
      }
    };

    const response: GatewayResponse<CompareTestResponse> = {
      data: compareResponse,
      success: true,
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime,
        models_compared: compareRequest.models.length,
        successful_tests: successfulResults.length
      }
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error comparing models:', error)
    const response: GatewayResponse<null> = {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Model comparison failed',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      }
    };

    return Response.json(response, { status: 500 });
  }
}
