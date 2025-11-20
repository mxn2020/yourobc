// convex/lib/boilerplate/ai_tests/mutations.ts

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { calculateTestSummary, getDefaultTestSummary } from './utils';
import { requireCurrentUser, requireOwnershipOrAdmin } from '@/shared/auth.helper';
import { aiTestTypes, statusTypes } from '@/schema/base';
import { generateUniquePublicId } from '@/shared/utils/publicId';

const resultStatusSchema = v.union(v.literal('completed'), v.literal('failed'));

const usageSchema = v.object({
  inputTokens: v.number(),
  outputTokens: v.number(),
  totalTokens: v.number(),
  reasoningTokens: v.optional(v.number()),
  cachedInputTokens: v.optional(v.number()),
});

const errorSchema = v.object({
  message: v.string(),
  type: v.string(),
  code: v.optional(v.string()),
  stack: v.optional(v.string()),
  details: v.optional(v.any()),
});

const testResultSchema = v.object({
  id: v.string(),
  iteration: v.number(),
  status: resultStatusSchema,
  response: v.optional(v.string()),
  usage: usageSchema,
  cost: v.number(),
  latencyMs: v.number(),
  finishReason: v.optional(v.string()),
  warnings: v.array(v.any()),
  firstTokenLatencyMs: v.optional(v.number()),
  tokensPerSecond: v.optional(v.number()),
  wordsPerMinute: v.optional(v.number()),
  validationResults: v.optional(v.any()),
  error: v.optional(errorSchema),
  logId: v.optional(v.id('aiLogs')),
  executedAt: v.number(),
});

/**
 * Create a new AI test
 * 🔒 Authentication: Required
 */
export const createAITest = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    type: aiTestTypes,
    modelId: v.string(),
    provider: v.string(),
    parameters: v.any(),
    iterations: v.optional(v.number()),
    timeout: v.optional(v.number()),
    expectedResults: v.optional(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedName = args.name.trim();
    const trimmedDescription = args.description?.trim();
    const trimmedModelId = args.modelId.trim();
    const trimmedProvider = args.provider.trim();

    // 3. Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'aiTests');

    // 4. Create AI test
    const now = Date.now();
    const testId = await ctx.db.insert('aiTests', {
      publicId,
      userId: user._id,
      name: trimmedName,
      description: trimmedDescription,
      type: args.type,
      modelId: trimmedModelId,
      provider: trimmedProvider,
      parameters: args.parameters,
      iterations: args.iterations,
      timeout: args.timeout,
      expectedResults: args.expectedResults,
      status: 'pending',
      results: [],
      summary: getDefaultTestSummary(),
      extendedMetadata: args.metadata || {},
      metadata: undefined,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });

    // 5. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.create',
      entityType: 'ai_tests',
      entityId: testId,
      entityTitle: trimmedName,
      description: `Created AI test: ${trimmedName}`,
      metadata: {
        type: args.type,
        modelId: trimmedModelId,
        provider: trimmedProvider,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Return test ID
    return testId;
  },
});

/**
 * Update an existing AI test
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateAITest = mutation({
  args: {
    testId: v.id('aiTests'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(statusTypes.testStatus),
      modelId: v.optional(v.string()),
      provider: v.optional(v.string()),
      parameters: v.optional(v.any()),
      iterations: v.optional(v.number()),
      timeout: v.optional(v.number()),
      expectedResults: v.optional(v.any()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { testId, updates }) => {
    // 1. Get user for audit logging
    const user = await requireCurrentUser(ctx);

    // 2. Direct O(1) lookup by _id
    const test = await ctx.db.get(testId);

    if (!test) {
      throw new Error('AI test not found');
    }

    // 3. Check permissions
    await requireOwnershipOrAdmin(ctx, test.userId);

    // 4. Trim string fields in updates
    const trimmedUpdates: any = {};
    if (updates.name !== undefined) {
      const trimmed = updates.name.trim();
      if (trimmed.length === 0) {
        throw new Error('Name cannot be empty');
      }
      trimmedUpdates.name = trimmed;
    }
    if (updates.description !== undefined) {
      trimmedUpdates.description = updates.description.trim();
    }
    if (updates.modelId !== undefined) {
      trimmedUpdates.modelId = updates.modelId.trim();
    }
    if (updates.provider !== undefined) {
      trimmedUpdates.provider = updates.provider.trim();
    }
    if (updates.status !== undefined) trimmedUpdates.status = updates.status;
    if (updates.parameters !== undefined) trimmedUpdates.parameters = updates.parameters;
    if (updates.iterations !== undefined) trimmedUpdates.iterations = updates.iterations;
    if (updates.timeout !== undefined) trimmedUpdates.timeout = updates.timeout;
    if (updates.expectedResults !== undefined) trimmedUpdates.expectedResults = updates.expectedResults;

    // 5. Update with type-safe fields
    const now = Date.now();
    const updateData: any = {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    };

    // Handle metadata separately if provided
    if (updates.metadata) {
      updateData.extendedMetadata = updates.metadata;
    }

    await ctx.db.patch(testId, updateData);

    // 6. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.update',
      entityType: 'ai_tests',
      entityId: testId,
      entityTitle: trimmedUpdates.name || test.name,
      description: `Updated AI test: ${trimmedUpdates.name || test.name}`,
      metadata: {
        updates: Object.keys(trimmedUpdates),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. Return test ID
    return testId;
  },
});

/**
 * Add a test result to an existing test
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const addTestResult = mutation({
  args: {
    testId: v.id('aiTests'),
    result: testResultSchema,
  },
  handler: async (ctx, { testId, result }) => {
    // 1. Get user for audit logging
    const user = await requireCurrentUser(ctx);

    // 2. Direct O(1) lookup
    const test = await ctx.db.get(testId);

    if (!test) {
      throw new Error('AI test not found');
    }

    // 3. Check permissions
    await requireOwnershipOrAdmin(ctx, test.userId);

    // 4. Trim string fields in result
    const trimmedResult: any = {
      ...result,
      response: result.response?.trim(),
      finishReason: result.finishReason?.trim(),
    };

    // Trim error fields if error exists
    if (result.error) {
      trimmedResult.error = {
        ...result.error,
        message: result.error.message.trim(),
        type: result.error.type.trim(),
        code: result.error.code?.trim(),
        stack: result.error.stack?.trim(),
      };
    }

    // 5. Add result to test
    const updatedResults = [...test.results, trimmedResult];

    // 6. Recalculate summary using utility function
    const updatedSummary = calculateTestSummary(updatedResults);

    // 7. Update test with new results
    const now = Date.now();
    await ctx.db.patch(testId, {
      results: updatedResults,
      summary: updatedSummary,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 8. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.add_result',
      entityType: 'ai_tests',
      entityId: testId,
      entityTitle: test.name,
      description: `Added test result (iteration ${result.iteration}) to: ${test.name}`,
      metadata: {
        iteration: result.iteration,
        status: result.status,
        latencyMs: result.latencyMs,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 9. Return test ID
    return testId;
  },
});

/**
 * Update test status
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateTestStatus = mutation({
  args: {
    testId: v.id('aiTests'),
    status: statusTypes.testStatus,
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, { testId, status, startedAt, completedAt, duration }) => {
    // 1. Get user for audit logging
    const user = await requireCurrentUser(ctx);

    // 2. Direct O(1) lookup
    const test = await ctx.db.get(testId);

    if (!test) {
      throw new Error('AI test not found');
    }

    // 3. Check permissions
    await requireOwnershipOrAdmin(ctx, test.userId);

    // 4. Build updates
    const now = Date.now();
    const updates: any = {
      status,
      updatedAt: now,
      updatedBy: user._id,
    };

    if (startedAt !== undefined) updates.startedAt = startedAt;
    if (completedAt !== undefined) updates.completedAt = completedAt;
    if (duration !== undefined) updates.duration = duration;

    // 5. Update test status
    await ctx.db.patch(testId, updates);

    // 6. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.update_status',
      entityType: 'ai_tests',
      entityId: testId,
      entityTitle: test.name,
      description: `Updated status of AI test "${test.name}" to: ${status}`,
      metadata: {
        oldStatus: test.status,
        newStatus: status,
        startedAt,
        completedAt,
        duration,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. Return test ID
    return testId;
  },
});

/**
 * Delete an AI test
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteAITest = mutation({
  args: {
    testId: v.id('aiTests'),
  },
  handler: async (ctx, { testId }) => {
    // 1. Get user for audit logging
    const user = await requireCurrentUser(ctx);

    // 2. Direct O(1) lookup
    const test = await ctx.db.get(testId);

    if (!test) {
      throw new Error('AI test not found');
    }

    // 3. Check permissions
    await requireOwnershipOrAdmin(ctx, test.userId);

    // 4. Soft delete test
    const now = Date.now();
    await ctx.db.patch(testId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.delete',
      entityType: 'ai_tests',
      entityId: testId,
      entityTitle: test.name,
      description: `Deleted AI test: ${test.name}`,
      metadata: {
        type: test.type,
        modelId: test.modelId,
        provider: test.provider,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Return test ID
    return testId;
  },
});

/**
 * Delete an AI test by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteAITestByPublicId = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const trimmedPublicId = publicId.trim();

    // 3. Find test by public ID
    const test = await ctx.db
      .query('aiTests')
      .withIndex('by_publicId', (q) => q.eq('publicId', trimmedPublicId))
      .first();

    if (!test) {
      throw new Error('AI test not found');
    }

    // 4. Check permissions
    await requireOwnershipOrAdmin(ctx, test.userId);

    // 5. Soft delete test
    const now = Date.now();
    await ctx.db.patch(test._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Create audit log
    const userName = (user.name || user.email || 'User').trim();
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: 'ai_tests.delete_by_public_id',
      entityType: 'ai_tests',
      entityId: test._id,
      entityTitle: test.name,
      description: `Deleted AI test by publicId: ${test.name}`,
      metadata: {
        publicId: trimmedPublicId,
        type: test.type,
        modelId: test.modelId,
        provider: test.provider,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 7. Return test ID
    return test._id;
  },
});
