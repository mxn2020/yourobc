// convex/lib/boilerplate/ai_logs/mutations.ts

import { v } from 'convex/values';
import { mutation } from '@/generated/server';
import { requireCurrentUser, requireOwnershipOrAdmin, requirePermission } from '@/shared/auth.helper';
import { generateUniquePublicId } from '@/shared/utils/publicId';
import { AI_LOGS_CONSTANTS } from './constants';

// Simplified parameter schema that can handle various AI SDK inputs
const parametersSchema = v.object({
  temperature: v.optional(v.number()),
  maxTokens: v.optional(v.number()),
  topP: v.optional(v.number()),
  topK: v.optional(v.number()),
  frequencyPenalty: v.optional(v.number()),
  presencePenalty: v.optional(v.number()),
  stopSequences: v.optional(v.array(v.string())),
  responseFormat: v.optional(
    v.object({
      type: v.union(v.literal('text'), v.literal('json')),
      schema: v.optional(v.any()),
    })
  ),
  tools: v.optional(
    v.array(
      v.object({
        type: v.string(),
        name: v.string(),
        description: v.optional(v.string()),
        inputSchema: v.optional(v.any()),
      })
    )
  ),
  schema: v.optional(v.any()),
  enableCaching: v.optional(v.boolean()),
  contextLength: v.optional(v.number()),
});

// Simplified usage schema
const usageSchema = v.object({
  inputTokens: v.optional(v.number()),
  outputTokens: v.optional(v.number()),
  totalTokens: v.optional(v.number()),
  reasoningTokens: v.optional(v.number()),
  cachedInputTokens: v.optional(v.number()),
});

// Simplified tool call schema
const toolCallSchema = v.object({
  id: v.string(),
  name: v.string(),
  input: v.any(),
  output: v.optional(v.any()),
  providerExecuted: v.optional(v.boolean()),
});

// Simplified metadata schema
const metadataSchema = v.object({
  requestId: v.string(),
  traceId: v.optional(v.string()),
  parentRequestId: v.optional(v.string()),
  sessionId: v.optional(v.string()),
  feature: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  sdkVersion: v.optional(v.string()),
  providerRequestId: v.optional(v.string()),
  cacheHit: v.optional(v.boolean()),
  rateLimited: v.optional(v.boolean()),
  objectType: v.optional(v.string()),
  cache: v.optional(
    v.object({
      applicationCache: v.optional(
        v.object({
          hit: v.boolean(),
          key: v.optional(v.string()),
          ttl: v.optional(v.number()),
        })
      ),
      providerCache: v.optional(
        v.object({
          hit: v.boolean(),
          provider: v.union(
            v.literal('anthropic'),
            v.literal('openai'),
            v.literal('other')
          ),
          cachedTokens: v.optional(v.number()),
          cacheType: v.optional(
            v.union(
              v.literal('ephemeral'),
              v.literal('persistent'),
              v.literal('automatic')
            )
          ),
        })
      ),
      cacheHit: v.optional(v.boolean()),
    })
  ),
  cacheWritten: v.optional(v.boolean()),
  testRun: v.optional(v.number()),
  firstTokenLatency: v.optional(v.number()),
  tokensPerSecond: v.optional(v.number()),
  wordsPerMinute: v.optional(v.number()),
});

/**
 * Create a new AI log entry
 * 🔒 Authentication: Required
 * 🔒 Authorization: User must have 'ai_logs:create' permission
 */
export const createAILog = mutation({
  args: {
    modelId: v.string(),
    provider: v.string(),
    requestType: v.union(
      v.literal('text_generation'),
      v.literal('streaming'),
      v.literal('object_generation'),
      v.literal('embedding'),
      v.literal('image_generation'),
      v.literal('speech'),
      v.literal('transcription'),
      v.literal('test')
    ),
    prompt: v.string(),
    systemPrompt: v.optional(v.string()),
    parameters: parametersSchema,
    response: v.optional(v.string()),
    usage: usageSchema,
    finishReason: v.optional(v.string()),
    warnings: v.optional(v.array(v.any())),
    providerMetadata: v.optional(v.any()),
    responseMetadata: v.optional(v.any()),
    gatewayMetadata: v.optional(v.any()),
    toolCalls: v.optional(v.array(toolCallSchema)),
    files: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal('input'), v.literal('output')),
          mediaType: v.string(),
          data: v.string(),
          filename: v.optional(v.string()),
        })
      )
    ),
    cost: v.number(),
    latencyMs: v.number(),
    success: v.boolean(),
    errorMessage: v.optional(v.string()),
    errorType: v.optional(v.string()),
    retryCount: v.optional(v.number()),
    requestHeaders: v.optional(v.any()),
    responseHeaders: v.optional(v.any()),
    requestBody: v.optional(v.any()),
    responseBody: v.optional(v.any()),
    metadata: metadataSchema,
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization
    await requirePermission(ctx, AI_LOGS_CONSTANTS.PERMISSIONS.CREATE);

    const now = Date.now();

    // 3. Generate unique public ID
    const publicId = await generateUniquePublicId(ctx, 'aiLogs');

    // 4. Prepare data with trimmed strings
    const logId = await ctx.db.insert('aiLogs', {
      publicId,
      userId: user._id,
      modelId: args.modelId.trim(),
      provider: args.provider.trim(),
      requestType: args.requestType,
      prompt: args.prompt.trim(),
      systemPrompt: args.systemPrompt?.trim(),
      parameters: args.parameters,
      response: args.response?.trim(),
      usage: args.usage,
      finishReason: args.finishReason?.trim(),
      warnings: args.warnings,
      providerMetadata: args.providerMetadata,
      responseMetadata: args.responseMetadata,
      gatewayMetadata: args.gatewayMetadata,
      toolCalls: args.toolCalls,
      files: args.files,
      cost: args.cost,
      latencyMs: args.latencyMs,
      success: args.success,
      errorMessage: args.errorMessage?.trim(),
      errorType: args.errorType?.trim(),
      retryCount: args.retryCount,
      requestHeaders: args.requestHeaders,
      responseHeaders: args.responseHeaders,
      requestBody: args.requestBody,
      responseBody: args.responseBody,
      extendedMetadata: args.metadata,
      metadata: undefined,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'ai_log.created',
      entityType: 'ai_log',
      entityId: logId,
      entityTitle: `${args.provider} - ${args.modelId}`,
      description: `Created AI log for ${args.provider} ${args.modelId} (${args.requestType})`,
      createdAt: now,
    });

    // 6. Return log ID
    return logId;
  },
});

/**
 * Update an existing AI log entry
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only + 'ai_logs:update' permission
 */
export const updateAILog = mutation({
  args: {
    logId: v.id('aiLogs'),
    updates: v.object({
      response: v.optional(v.string()),
      usage: v.optional(usageSchema),
      finishReason: v.optional(v.string()),
      warnings: v.optional(v.array(v.any())),
      cost: v.optional(v.number()),
      latencyMs: v.optional(v.number()),
      success: v.optional(v.boolean()),
      errorMessage: v.optional(v.string()),
      errorType: v.optional(v.string()),
      metadata: v.optional(v.any()),
    }),
  },
  handler: async (ctx, { logId, updates }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, AI_LOGS_CONSTANTS.PERMISSIONS.UPDATE);

    // 3. Get log and check existence
    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('AI log not found');
    }

    // 4. Authorization - Ownership
    await requireOwnershipOrAdmin(ctx, log.userId);

    const now = Date.now();

    // 5. Prepare update data with trimmed strings
    const updateData: any = {
      updatedAt: now,
      updatedBy: user._id,
    };

    if (updates.response !== undefined) updateData.response = updates.response?.trim();
    if (updates.usage !== undefined) updateData.usage = updates.usage;
    if (updates.finishReason !== undefined) updateData.finishReason = updates.finishReason?.trim();
    if (updates.warnings !== undefined) updateData.warnings = updates.warnings;
    if (updates.cost !== undefined) updateData.cost = updates.cost;
    if (updates.latencyMs !== undefined) updateData.latencyMs = updates.latencyMs;
    if (updates.success !== undefined) updateData.success = updates.success;
    if (updates.errorMessage !== undefined) updateData.errorMessage = updates.errorMessage?.trim();
    if (updates.errorType !== undefined) updateData.errorType = updates.errorType?.trim();

    // Handle metadata separately if provided
    if (updates.metadata) {
      updateData.extendedMetadata = updates.metadata;
    }

    // 6. Update log
    await ctx.db.patch(logId, updateData);

    // 7. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'ai_log.updated',
      entityType: 'ai_log',
      entityId: logId,
      entityTitle: `${log.provider} - ${log.modelId}`,
      description: `Updated AI log for ${log.provider} ${log.modelId}`,
      createdAt: now,
    });

    // 8. Return log ID
    return logId;
  },
});

/**
 * Delete an AI log entry by Convex ID (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only + 'ai_logs:delete' permission
 */
export const deleteAILog = mutation({
  args: {
    logId: v.id('aiLogs'),
  },
  handler: async (ctx, { logId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, AI_LOGS_CONSTANTS.PERMISSIONS.DELETE);

    // 3. Get log and check existence
    const log = await ctx.db.get(logId);
    if (!log || log.deletedAt) {
      throw new Error('AI log not found');
    }

    // 4. Authorization - Ownership
    await requireOwnershipOrAdmin(ctx, log.userId);

    const now = Date.now();

    // 5. Soft delete the log
    await ctx.db.patch(logId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'ai_log.deleted',
      entityType: 'ai_log',
      entityId: logId,
      entityTitle: `${log.provider} - ${log.modelId}`,
      description: `Deleted AI log for ${log.provider} ${log.modelId}`,
      createdAt: now,
    });

    // 7. Return log ID
    return logId;
  },
});

/**
 * Delete an AI log entry by public ID (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only + 'ai_logs:delete' permission
 */
export const deleteAILogByPublicId = mutation({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Authorization - Permission
    await requirePermission(ctx, AI_LOGS_CONSTANTS.PERMISSIONS.DELETE);

    // 3. Get log by publicId and check existence
    const log = await ctx.db
      .query('aiLogs')
      .withIndex('by_publicId', (q) => q.eq('publicId', publicId.trim()))
      .first();

    if (!log || log.deletedAt) {
      throw new Error('AI log not found');
    }

    // 4. Authorization - Ownership
    await requireOwnershipOrAdmin(ctx, log.userId);

    const now = Date.now();

    // 5. Soft delete the log
    await ctx.db.patch(log._id, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Audit log
    await ctx.db.insert('auditLogs', {
      id: crypto.randomUUID(),
      userId: user._id,
      userName: user.name || user.email || 'Unknown User',
      action: 'ai_log.deleted',
      entityType: 'ai_log',
      entityId: log._id,
      entityTitle: `${log.provider} - ${log.modelId}`,
      description: `Deleted AI log for ${log.provider} ${log.modelId} (by publicId)`,
      createdAt: now,
    });

    // 7. Return log ID
    return log._id;
  },
});
