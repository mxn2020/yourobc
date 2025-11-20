// convex/schema/boilerplate/ai/ai_tests/ai_tests.ts
// Table definitions for ai_tests module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields, metadataSchema } from '@/schema/base';
import { aiTestsValidators } from './validators';

export const aiTestsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  userId: v.id('userProfiles'),

  // Required: Main display field
  name: v.string(),

  // Test configuration
  description: v.optional(v.string()),
  type: aiTestsValidators.type,
  modelId: v.string(),
  provider: v.string(),

  // Test parameters
  parameters: aiTestsValidators.parameters,

  // Test execution settings
  iterations: v.optional(v.number()),
  timeout: v.optional(v.number()),

  // Expected results for validation
  expectedResults: v.optional(aiTestsValidators.expectedResults),

  // Test execution results
  status: aiTestsValidators.status,

  // Results from individual test iterations
  results: v.array(aiTestsValidators.testResult),

  // Aggregated test summary
  summary: aiTestsValidators.summary,

  // Test execution metadata
  extendedMetadata: aiTestsValidators.extendedMetadata,

  // Timestamps
  startedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  duration: v.optional(v.number()),

  // Standard metadata and audit fields
  metadata: metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_publicId', ['publicId'])
  .index('by_user_id', ['userId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_model_id', ['modelId'])
  .index('by_provider', ['provider'])
  .index('by_type', ['type'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_user_id_created_at', ['userId', 'createdAt'])
  .index('by_model_id_created_at', ['modelId', 'createdAt'])
  .index('by_test_run_id', ['extendedMetadata.testRunId'])
  .index('by_batch_id', ['extendedMetadata.batchId'])
  .index('by_user_id_status', ['userId', 'status'])
  .index('by_completed_at', ['completedAt']);
