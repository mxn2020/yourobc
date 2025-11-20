// convex/schema/boilerplate/ai/ai_logs/validators.ts
// Grouped validators for ai_logs module

import { v } from 'convex/values';

export const aiLogsValidators = {
  requestType: v.union(
    v.literal('completion'),
    v.literal('chat'),
    v.literal('embedding'),
    v.literal('image_generation'),
    v.literal('audio_generation'),
    v.literal('transcription'),
    v.literal('translation'),
    v.literal('moderation'),
    v.literal('tool_use')
  ),

  responseFormat: v.object({
    type: v.union(v.literal('text'), v.literal('json')),
    schema: v.optional(v.any()),
  }),

  toolCall: v.object({
    id: v.string(),
    name: v.string(),
    input: v.any(),
    output: v.optional(v.any()),
    error: v.optional(v.string()),
    providerExecuted: v.optional(v.boolean()),
  }),

  file: v.object({
    type: v.union(v.literal('input'), v.literal('output')),
    mediaType: v.string(),
    data: v.string(),
    filename: v.optional(v.string()),
  }),

  parameters: v.object({
    temperature: v.optional(v.number()),
    maxTokens: v.optional(v.number()),
    topP: v.optional(v.number()),
    topK: v.optional(v.number()),
    frequencyPenalty: v.optional(v.number()),
    presencePenalty: v.optional(v.number()),
    stopSequences: v.optional(v.array(v.string())),
    responseFormat: v.optional(v.object({
      type: v.union(v.literal('text'), v.literal('json')),
      schema: v.optional(v.any()),
    })),
    tools: v.optional(v.array(v.any())),
    schema: v.optional(v.any()),
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

  cache: v.object({
    enabled: v.optional(v.boolean()),
    hit: v.optional(v.boolean()),
    written: v.optional(v.boolean()),
    key: v.optional(v.string()),
    ttl: v.optional(v.number()),
    size: v.optional(v.number()),
  }),

  extendedMetadata: v.object({
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    pageUrl: v.optional(v.string()),
    feature: v.optional(v.string()),
    requestId: v.string(),
    traceId: v.optional(v.string()),
    parentRequestId: v.optional(v.string()),
    modelVersion: v.optional(v.string()),
    sdkVersion: v.optional(v.string()),
    providerRequestId: v.optional(v.string()),
    cache: v.object({
      enabled: v.optional(v.boolean()),
      hit: v.optional(v.boolean()),
      written: v.optional(v.boolean()),
      key: v.optional(v.string()),
      ttl: v.optional(v.number()),
      size: v.optional(v.number()),
    }),
    cacheHit: v.optional(v.boolean()),
    rateLimited: v.optional(v.boolean()),
    cacheWritten: v.optional(v.boolean()),
    testRun: v.optional(v.number()),
    firstTokenLatency: v.optional(v.number()),
    tokensPerSecond: v.optional(v.number()),
    wordsPerMinute: v.optional(v.number()),
    objectType: v.optional(v.string()),
    testId: v.optional(v.id('aiTests')),
  }),
} as const;
