// convex/lib/boilerplate/ai_logs/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { getCurrentUser, requireAdmin } from '@/shared/auth.helper';
import { AI_LOGS_CONSTANTS } from './constants';
import { getTimePeriodStarts, matchesSearch } from './utils';

/**
 * Get AI logs with optional filtering and pagination
 * 🔒 Authentication: Required
 */
export const getAILogs = query({
  args: {
    search: v.optional(v.string()),
    modelId: v.optional(v.string()),
    provider: v.optional(v.string()),
    requestType: v.optional(v.string()),
    success: v.optional(v.boolean()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    if (!currentUser) {
      throw new Error('Authentication required to access AI logs');
    }

    // ✅ Use indexed query for performance
    let logs = await ctx.db
      .query('aiLogs')
      .withIndex('by_user_id_created_at', (q) => q.eq('userId', currentUser._id))
      .order('desc')
      .collect();

    // Apply filters in memory
    if (args.modelId) {
      logs = logs.filter((log) => log.modelId === args.modelId);
    }

    if (args.provider) {
      logs = logs.filter((log) => log.provider === args.provider);
    }

    if (args.requestType) {
      logs = logs.filter((log) => log.requestType === args.requestType);
    }

    if (args.success !== undefined) {
      logs = logs.filter((log) => log.success === args.success);
    }

    if (args.startDate !== undefined) {
      logs = logs.filter((log) => log.createdAt >= args.startDate!);
    }

    if (args.endDate !== undefined) {
      logs = logs.filter((log) => log.createdAt <= args.endDate!);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      logs = logs.filter((log) => matchesSearch(log, searchLower));
    }

    const total = logs.length;
    const offset = args.offset || 0;
    const limit = args.limit || AI_LOGS_CONSTANTS.LIMITS.DEFAULT_PAGE_SIZE;

    const paginatedLogs = logs.slice(offset, offset + limit);

    return {
      logs: paginatedLogs,
      total,
      hasMore: offset + limit < total,
    };
  },
});

/**
 * Get a single AI log by ID (Convex internal ID)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const getAILog = query({
  args: { logId: v.id('aiLogs') },
  handler: async (ctx, { logId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI log');
    }

    // ✅ Direct O(1) lookup
    const log = await ctx.db.get(logId);

    if (!log) {
      return null;
    }

    // Check permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin && log.userId !== currentUser._id) {
      throw new Error('Access denied: Can only access your own AI logs');
    }

    return log;
  },
});

/**
 * Get a single AI log by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const getAILogByPublicId = query({
  args: { publicId: v.string() },
  handler: async (ctx, { publicId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI log');
    }

    // ✅ Indexed lookup by publicId
    const log = await ctx.db
      .query('aiLogs')
      .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
      .first();

    if (!log) {
      return null;
    }

    // Check permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin && log.userId !== currentUser._id) {
      throw new Error('Access denied: Can only access your own AI logs');
    }

    return log;
  },
});

/**
 * Get AI log statistics and analytics
 * 🔒 Authentication: Required
 */
export const getAILogStats = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI log statistics');
    }

    // Use provided date range or default to last 30 days
    const endTime = args.endDate || Date.now();
    const startTime = args.startDate || (endTime - 30 * 24 * 60 * 60 * 1000);

    // Fetch logs based on user permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    let logs;

    if (isAdmin) {
      logs = await ctx.db
        .query('aiLogs')
        .withIndex('by_created_at', (q) => q.gte('createdAt', startTime).lte('createdAt', endTime))
        .order('desc')
        .take(AI_LOGS_CONSTANTS.LIMITS.MAX_LOGS_PER_QUERY || 10000);
    } else {
      logs = await ctx.db
        .query('aiLogs')
        .withIndex('by_user_id_created_at', (q) => q.eq('userId', currentUser._id))
        .order('desc')
        .collect();

      logs = logs.filter((log) => log.createdAt >= startTime && log.createdAt <= endTime);
    }

    // Calculate basic metrics
    const totalRequests = logs.length;
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const totalTokens = logs.reduce((sum, log) => sum + (log.usage.totalTokens || 0), 0);
    const totalInputTokens = logs.reduce((sum, log) => sum + (log.usage.inputTokens || 0), 0);
    const totalOutputTokens = logs.reduce((sum, log) => sum + (log.usage.outputTokens || 0), 0);
    const successfulRequests = logs.filter((log) => log.success).length;
    const totalLatency = logs.reduce((sum, log) => sum + log.latencyMs, 0);

    // Calculate time series data (requestsByDay)
    const dayMap = new Map<string, { requests: number; cost: number; tokens: number; latency: number; successes: number }>();

    logs.forEach((log) => {
      const date = new Date(log.createdAt).toISOString().split('T')[0];
      const existing = dayMap.get(date) || { requests: 0, cost: 0, tokens: 0, latency: 0, successes: 0 };

      dayMap.set(date, {
        requests: existing.requests + 1,
        cost: existing.cost + log.cost,
        tokens: existing.tokens + (log.usage.totalTokens || 0),
        latency: existing.latency + log.latencyMs,
        successes: existing.successes + (log.success ? 1 : 0),
      });
    });

    const requestsByDay = Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      requests: data.requests,
      cost: data.cost,
      tokens: data.tokens,
      avgLatency: data.requests > 0 ? data.latency / data.requests : 0,
      successRate: data.requests > 0 ? (data.successes / data.requests) * 100 : 0,
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate model performance (topModels)
    const modelMap = new Map<string, { requests: number; cost: number; tokens: number; latency: number; successes: number }>();

    logs.forEach((log) => {
      const existing = modelMap.get(log.modelId) || { requests: 0, cost: 0, tokens: 0, latency: 0, successes: 0 };

      modelMap.set(log.modelId, {
        requests: existing.requests + 1,
        cost: existing.cost + log.cost,
        tokens: existing.tokens + (log.usage.totalTokens || 0),
        latency: existing.latency + log.latencyMs,
        successes: existing.successes + (log.success ? 1 : 0),
      });
    });

    const topModels = Array.from(modelMap.entries()).map(([modelId, data]) => ({
      modelId,
      requests: data.requests,
      cost: data.cost,
      tokens: data.tokens,
      avgLatency: data.requests > 0 ? data.latency / data.requests : 0,
      successRate: data.requests > 0 ? (data.successes / data.requests) * 100 : 0,
      avgCostPerToken: data.tokens > 0 ? data.cost / data.tokens : 0,
    })).sort((a, b) => b.requests - a.requests);

    // Calculate provider breakdown
    const providerMap = new Map<string, { requests: number; cost: number; tokens: number; latency: number; successes: number; models: Set<string> }>();

    logs.forEach((log) => {
      const existing = providerMap.get(log.provider) || { requests: 0, cost: 0, tokens: 0, latency: 0, successes: 0, models: new Set() };

      existing.models.add(log.modelId);
      providerMap.set(log.provider, {
        requests: existing.requests + 1,
        cost: existing.cost + log.cost,
        tokens: existing.tokens + (log.usage.totalTokens || 0),
        latency: existing.latency + log.latencyMs,
        successes: existing.successes + (log.success ? 1 : 0),
        models: existing.models,
      });
    });

    const providerBreakdown = Array.from(providerMap.entries()).map(([provider, data]) => ({
      provider,
      requests: data.requests,
      cost: data.cost,
      tokens: data.tokens,
      avgLatency: data.requests > 0 ? data.latency / data.requests : 0,
      successRate: data.requests > 0 ? (data.successes / data.requests) * 100 : 0,
      modelsUsed: Array.from(data.models),
    }));

    // Calculate feature breakdown
    const featureMap = new Map<string, { requests: number; cost: number; latency: number }>();

    logs.forEach((log) => {
      const feature = log.extendedMetadata?.feature || 'unknown';
      const existing = featureMap.get(feature) || { requests: 0, cost: 0, latency: 0 };

      featureMap.set(feature, {
        requests: existing.requests + 1,
        cost: existing.cost + log.cost,
        latency: existing.latency + log.latencyMs,
      });
    });

    const featureBreakdown = Array.from(featureMap.entries()).map(([feature, data]) => ({
      feature,
      requests: data.requests,
      cost: data.cost,
      avgLatency: data.requests > 0 ? data.latency / data.requests : 0,
    }));

    // Calculate error breakdown
    const errorMap = new Map<string, { count: number; examples: string[] }>();

    logs.filter((log) => !log.success && log.errorType).forEach((log) => {
      const errorType = log.errorType || 'unknown_error';
      const existing = errorMap.get(errorType) || { count: 0, examples: [] };

      if (existing.examples.length < 3 && log.errorMessage) {
        existing.examples.push(log.errorMessage);
      }

      errorMap.set(errorType, {
        count: existing.count + 1,
        examples: existing.examples,
      });
    });

    const totalErrors = logs.filter((log) => !log.success).length;
    const errorBreakdown = Array.from(errorMap.entries()).map(([errorType, data]) => ({
      errorType,
      count: data.count,
      percentage: totalErrors > 0 ? (data.count / totalErrors) * 100 : 0,
      recentExamples: data.examples,
    }));

    // Calculate finish reason breakdown
    const finishReasonMap = new Map<string, number>();

    logs.filter((log) => log.finishReason).forEach((log) => {
      const finishReason = log.finishReason!;
      finishReasonMap.set(finishReason, (finishReasonMap.get(finishReason) || 0) + 1);
    });

    const logsWithFinishReason = logs.filter((log) => log.finishReason).length;
    const finishReasonBreakdown = Array.from(finishReasonMap.entries()).map(([finishReason, count]) => ({
      finishReason,
      count,
      percentage: logsWithFinishReason > 0 ? (count / logsWithFinishReason) * 100 : 0,
    }));

    // Calculate token distribution
    const tokenRanges = [
      { range: '0-1k', min: 0, max: 1000 },
      { range: '1k-10k', min: 1000, max: 10000 },
      { range: '10k-50k', min: 10000, max: 50000 },
      { range: '50k-100k', min: 50000, max: 100000 },
      { range: '100k+', min: 100000, max: Infinity },
    ];

    const tokenDistribution = tokenRanges.map(({ range, min, max }) => ({
      range,
      count: logs.filter((log) => {
        const tokens = log.usage.totalTokens || 0;
        return tokens >= min && tokens < max;
      }).length,
    }));

    return {
      totalRequests,
      totalCost,
      totalTokens,
      successRate: totalRequests > 0 ? (successfulRequests / totalRequests) * 100 : 0,
      avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
      avgCostPerToken: totalTokens > 0 ? totalCost / totalTokens : 0,
      requestsByDay,
      topModels,
      providerBreakdown,
      featureBreakdown,
      errorBreakdown,
      finishReasonBreakdown,
      tokenUsage: {
        avgInputTokens: totalRequests > 0 ? totalInputTokens / totalRequests : 0,
        avgOutputTokens: totalRequests > 0 ? totalOutputTokens / totalRequests : 0,
        totalInputTokens,
        totalOutputTokens,
        tokenDistribution,
      },
      // Simple count objects for quick lookups (derived from arrays above)
      modelCounts: Object.fromEntries(
        topModels.map((m) => [m.modelId, m.requests])
      ),
      providerCounts: Object.fromEntries(
        providerBreakdown.map((p) => [p.provider, p.requests])
      ),
      requestTypeCounts: Object.fromEntries(
        featureBreakdown.map((f) => [f.feature, f.requests])
      ),
    };
  },
});