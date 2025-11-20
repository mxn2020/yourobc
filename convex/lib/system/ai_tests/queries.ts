// convex/lib/boilerplate/ai_tests/queries.ts

import { v } from 'convex/values';
import { query } from '@/generated/server';
import { getCurrentUser } from '@/shared/auth.helper';
import { AI_TESTS_CONSTANTS } from './constants';
import { getTimePeriodStarts, matchesTestSearch } from './utils';

/**
 * Get AI tests with optional filtering and pagination
 * 🔒 Authentication: Required
 */
export const getAITests = query({
  args: {
    modelId: v.optional(v.string()),
    provider: v.optional(v.string()),
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);

    if (!currentUser) {
      throw new Error('Authentication required to access AI tests');
    }

    // ✅ Use indexed query
    const tests = await ctx.db
      .query('aiTests')
      .withIndex('by_user_id_created_at', (q) => q.eq('userId', currentUser._id))
      .order('desc')
      .collect();

    // Apply filters in memory
    let filteredTests = tests;

    if (args.modelId) {
      filteredTests = filteredTests.filter((test) => test.modelId === args.modelId);
    }

    if (args.provider) {
      filteredTests = filteredTests.filter((test) => test.provider === args.provider);
    }

    if (args.type) {
      filteredTests = filteredTests.filter((test) => test.type === args.type);
    }

    if (args.status) {
      filteredTests = filteredTests.filter((test) => test.status === args.status);
    }

    if (args.startDate !== undefined) {
      filteredTests = filteredTests.filter((test) => test.createdAt >= args.startDate!);
    }

    if (args.endDate !== undefined) {
      filteredTests = filteredTests.filter((test) => test.createdAt <= args.endDate!);
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredTests = filteredTests.filter((test) => matchesTestSearch(test, searchLower));
    }

    const total = filteredTests.length;
    const offset = args.offset || 0;
    const limit = args.limit || AI_TESTS_CONSTANTS.LIMITS.DEFAULT_PAGE_SIZE;

    const paginatedTests = filteredTests.slice(offset, offset + limit);

    return {
      tests: paginatedTests,
      total,
      hasMore: offset + limit < total,
    };
  },
});

/**
 * Get a single AI test by ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const getAITest = query({
  args: {
    testId: v.id('aiTests'),
  },
  handler: async (ctx, { testId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI test');
    }

    // ✅ Direct O(1) lookup
    const test = await ctx.db.get(testId);

    if (!test) {
      return null;
    }

    // Check permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin && test.userId !== currentUser._id) {
      throw new Error('Access denied: Can only access your own AI tests');
    }

    return test;
  },
});

/**
 * Get a single AI test by public ID
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const getAITestByPublicId = query({
  args: {
    publicId: v.string(),
  },
  handler: async (ctx, { publicId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI test');
    }

    const test = await ctx.db
      .query('aiTests')
      .withIndex('by_publicId', (q) => q.eq('publicId', publicId))
      .first();

    if (!test) {
      return null;
    }

    // Check permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin && test.userId !== currentUser._id) {
      throw new Error('Access denied: Can only access your own AI tests');
    }

    return test;
  },
});

/**
 * Get AI test analytics and statistics
 * 🔒 Authentication: Required
 */
export const getAITestStats = query({
  args: {
    timeWindow: v.optional(
      v.union(v.literal('day'), v.literal('week'), v.literal('month'), v.literal('all'))
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access AI test statistics');
    }

    const { dayStart, weekStart, monthStart } = getTimePeriodStarts();

    const timeWindow = args.timeWindow || 'month';
    let startTime: number;

    switch (timeWindow) {
      case 'day':
        startTime = dayStart;
        break;
      case 'week':
        startTime = weekStart;
        break;
      case 'month':
        startTime = monthStart;
        break;
      case 'all':
        startTime = Date.now() - 90 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = monthStart;
    }

    // ✅ Use indexed query
    let tests = await ctx.db
      .query('aiTests')
      .withIndex('by_user_id_created_at', (q) => q.eq('userId', currentUser._id))
      .order('desc')
      .take(AI_TESTS_CONSTANTS.LIMITS.MAX_TESTS_PER_QUERY || 5000);

    // Filter by time window
    tests = tests.filter((test) => test.createdAt >= startTime);

    const totalTests = tests.length;
    const completedTests = tests.filter((test) => test.status === 'completed');
    const totalCost = completedTests.reduce((sum, test) => sum + test.summary.totalCost, 0);
    const totalIterations = completedTests.reduce(
      (sum, test) => sum + test.summary.totalTests,
      0
    );
    const successfulIterations = completedTests.reduce(
      (sum, test) => sum + test.summary.passedTests,
      0
    );
    const totalLatency = completedTests.reduce(
      (sum, test) => sum + test.summary.avgLatency * test.summary.totalTests,
      0
    );

    const modelCounts = tests.reduce(
      (acc: Record<string, number>, test) => {
        acc[test.modelId] = (acc[test.modelId] || 0) + test.summary.totalTests;
        return acc;
      },
      {}
    );

    const providerCounts = tests.reduce(
      (acc: Record<string, number>, test) => {
        acc[test.provider] = (acc[test.provider] || 0) + test.summary.totalTests;
        return acc;
      },
      {}
    );

    const typeCounts = tests.reduce(
      (acc: Record<string, number>, test) => {
        acc[test.type] = (acc[test.type] || 0) + test.summary.totalTests;
        return acc;
      },
      {}
    );

    return {
      totalTests,
      totalIterations,
      totalCost,
      successRate:
        totalIterations > 0 ? (successfulIterations / totalIterations) * 100 : 0,
      avgLatency: totalIterations > 0 ? totalLatency / totalIterations : 0,
      avgCostPerIteration: totalIterations > 0 ? totalCost / totalIterations : 0,
      testsToday: tests.filter((test) => test.createdAt >= dayStart).length,
      testsThisWeek: tests.filter((test) => test.createdAt >= weekStart).length,
      testsThisMonth: tests.filter((test) => test.createdAt >= monthStart).length,
      modelCounts,
      providerCounts,
      typeCounts,
      recentTests: tests
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, AI_TESTS_CONSTANTS.LIMITS.MAX_RECENT_TESTS),
      timeWindow,
      dataLimited:
        tests.length >= (AI_TESTS_CONSTANTS.LIMITS.MAX_TESTS_PER_QUERY || 5000),
    };
  },
});

/**
 * Get test results with details
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const getTestResults = query({
  args: {
    testId: v.id('aiTests'),
  },
  handler: async (ctx, { testId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access test results');
    }

    // ✅ Direct O(1) lookup
    const test = await ctx.db.get(testId);

    if (!test) {
      throw new Error('AI test not found');
    }

    // Check permissions
    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin && test.userId !== currentUser._id) {
      throw new Error('Access denied: Can only access your own test results');
    }

    return test.results;
  },
});

/**
 * Get tests by batch ID (for batch operations)
 * 🔒 Authentication: Required
 */
export const getTestsByBatch = query({
  args: {
    batchId: v.string(),
  },
  handler: async (ctx, { batchId }) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) {
      throw new Error('Authentication required to access batch tests');
    }

    // ✅ Use indexed query if you have a batch_id index
    // Otherwise, filter user's tests in memory
    const tests = await ctx.db
      .query('aiTests')
      .withIndex('by_user_id_created_at', (q) => q.eq('userId', currentUser._id))
      .collect();

    // Filter by batch ID in memory
    const batchTests = tests.filter(
      (test) => test.extendedMetadata?.batchId === batchId
    );

    const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';
    if (!isAdmin) {
      return batchTests.filter((test) => test.userId === currentUser._id);
    }

    return batchTests;
  },
});
