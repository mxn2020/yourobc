// convex/schema/boilerplate/ai/ai_logs/ai_logs.ts
// Table definitions for ai_logs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { aiLogsValidators } from './validators';

export const aiLogsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  userId: v.id('userProfiles'),

  // AI provider information
  modelId: v.string(),
  provider: v.string(),
  requestType: aiLogsValidators.requestType,

  // Request data
  prompt: v.string(),
  systemPrompt: v.optional(v.string()),
  parameters: aiLogsValidators.parameters,

  // Response data
  response: v.optional(v.string()),
  usage: aiLogsValidators.usage,
  finishReason: v.optional(v.string()),
  warnings: v.optional(v.array(v.any())),

  // Metadata
  providerMetadata: v.optional(v.any()),
  responseMetadata: v.optional(v.any()),
  gatewayMetadata: v.optional(v.any()),

  // Tool calls and files
  toolCalls: v.optional(v.array(aiLogsValidators.toolCall)),
  files: v.optional(v.array(aiLogsValidators.file)),

  // Performance and cost
  cost: v.number(),
  latencyMs: v.number(),

  // Status and errors
  success: v.boolean(),
  errorMessage: v.optional(v.string()),
  errorType: v.optional(v.string()),
  retryCount: v.optional(v.number()),

  // Request/Response metadata
  requestHeaders: v.optional(v.any()),
  responseHeaders: v.optional(v.any()),
  requestBody: v.optional(v.any()),
  responseBody: v.optional(v.any()),

  // Session and context
  extendedMetadata: aiLogsValidators.extendedMetadata,

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_publicId', ['publicId'])
  .index('by_user', ['userId'])
  .index('by_deleted', ['deletedAt'])

  // Module-specific indexes
  .index('by_model', ['modelId'])
  .index('by_provider', ['provider'])
  .index('by_requestType', ['requestType'])
  .index('by_success', ['success'])
  .index('by_created_at', ['createdAt'])
  .index('by_user_id_created_at', ['userId', 'createdAt'])
  .index('by_model_id_created_at', ['modelId', 'createdAt'])
  .index('by_cost', ['cost'])
  .index('by_latency', ['latencyMs'])
  .index('by_testId', ['extendedMetadata.testId']);
