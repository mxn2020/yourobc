// convex/schema/boilerplate/ai/ai_tests/validators.ts
// Grouped validators for ai_tests module

import { v } from 'convex/values';

export const aiTestsValidators = {
  type: v.union(
    v.literal('single'),
    v.literal('batch'),
    v.literal('comparison'),
    v.literal('load'),
    v.literal('performance'),
    v.literal('accuracy')
  ),

  status: v.union(
    v.literal('pending'),
    v.literal('running'),
    v.literal('completed'),
    v.literal('failed'),
    v.literal('cancelled')
  ),

  iterationStatus: v.union(
    v.literal('completed'),
    v.literal('failed')
  ),

  parameters: v.object({
    prompt: v.optional(v.string()),
    systemPrompt: v.optional(v.string()),
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    topP: v.optional(v.number()),
    topK: v.optional(v.number()),
    frequencyPenalty: v.optional(v.number()),
    presencePenalty: v.optional(v.number()),
    stopSequences: v.optional(v.array(v.string())),
    schema: v.optional(v.any()),
    outputMode: v.optional(v.union(v.literal('object'), v.literal('array'), v.literal('enum'))),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    steps: v.optional(v.number()),
    guidance: v.optional(v.number()),
    seed: v.optional(v.number()),
    negativePrompt: v.optional(v.string()),
    voice: v.optional(v.string()),
    speed: v.optional(v.number()),
    format: v.optional(v.string()),
    language: v.optional(v.string()),
    transcriptionFormat: v.optional(v.string()),
    tools: v.optional(v.array(v.object({
      name: v.string(),
      description: v.string(),
      inputSchema: v.any(),
    }))),
    enableCaching: v.optional(v.boolean()),
    contextLength: v.optional(v.number()),
  }),

  usage: v.object({
    inputTokens: v.number(),
    outputTokens: v.number(),
    totalTokens: v.number(),
    reasoningTokens: v.optional(v.number()),
    cachedInputTokens: v.optional(v.number()),
  }),

  validationType: v.union(
    v.literal('regex'),
    v.literal('json_schema'),
    v.literal('custom')
  ),

  expectedResults: v.object({
    minTokens: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    maxLatency: v.optional(v.number()),
    maxCost: v.optional(v.number()),
    requiredFinishReasons: v.optional(v.array(v.string())),
    forbiddenFinishReasons: v.optional(v.array(v.string())),
    outputValidation: v.optional(v.object({
      type: v.union(v.literal('regex'), v.literal('json_schema'), v.literal('custom')),
      pattern: v.optional(v.string()),
      schema: v.optional(v.any()),
      validator: v.optional(v.string()),
    })),
    performanceThresholds: v.optional(v.object({
      minTokensPerSecond: v.optional(v.number()),
      maxFirstTokenLatency: v.optional(v.number()),
      minSuccessRate: v.optional(v.number()),
    })),
  }),

  testResult: v.object({
    id: v.string(),
    iteration: v.number(),
    status: v.union(v.literal('completed'), v.literal('failed')),
    response: v.optional(v.string()),
    usage: v.object({
      inputTokens: v.number(),
      outputTokens: v.number(),
      totalTokens: v.number(),
      reasoningTokens: v.optional(v.number()),
      cachedInputTokens: v.optional(v.number()),
    }),
    cost: v.number(),
    latencyMs: v.number(),
    finishReason: v.optional(v.string()),
    warnings: v.array(v.any()),
    firstTokenLatencyMs: v.optional(v.number()),
    tokensPerSecond: v.optional(v.number()),
    wordsPerMinute: v.optional(v.number()),
    validationResults: v.optional(v.object({
      passed: v.boolean(),
      checks: v.array(v.object({
        name: v.string(),
        passed: v.boolean(),
        expected: v.optional(v.any()),
        actual: v.optional(v.any()),
        message: v.optional(v.string()),
      })),
      score: v.optional(v.number()),
      details: v.optional(v.object({
        tokenValidation: v.optional(v.boolean()),
        latencyValidation: v.optional(v.boolean()),
        costValidation: v.optional(v.boolean()),
        outputValidation: v.optional(v.boolean()),
        performanceValidation: v.optional(v.boolean()),
      })),
    })),
    error: v.optional(v.object({
      message: v.string(),
      type: v.string(),
      code: v.optional(v.string()),
      stack: v.optional(v.string()),
      details: v.optional(v.any()),
    })),
    logId: v.optional(v.id('aiLogs')),
    executedAt: v.number(),
  }),

  summary: v.object({
    totalTests: v.number(),
    passedTests: v.number(),
    failedTests: v.number(),
    runningTests: v.number(),
    avgLatency: v.number(),
    totalCost: v.number(),
    successRate: v.number(),
    avgTokens: v.optional(v.number()),
    avgCostPerToken: v.optional(v.number()),
  }),

  extendedMetadata: v.object({
    testRunId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    feature: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    sdkVersion: v.optional(v.string()),
    iteration: v.optional(v.number()),
    testRunStartTime: v.optional(v.number()),
    batchId: v.optional(v.string()),
    batchSize: v.optional(v.number()),
    totalConfigs: v.optional(v.number()),
    requestId: v.optional(v.string()),
    disableCaching: v.optional(v.boolean()),
  }),
} as const;
