// convex/lib/system/analytics/queries.ts
// Query functions for analytics module

import { v } from 'convex/values';
import { query, QueryCtx } from '@/generated/server';
import { requireCurrentUser, getCurrentUser } from '@/shared/auth.helper';
import { Id, Doc } from '@/generated/dataModel';
import { canViewDashboard, canViewReport, filterDashboardsByAccess, filterReportsByAccess } from './permissions';

/**
 * Get metric data with time periods
 * Authentication: Required
 */
export const getMetric = query({
  args: {
    metricType: v.string(),
    period: v.union(
      v.literal('hour'),
      v.literal('day'),
      v.literal('week'),
      v.literal('month')
    ),
    startDate: v.number(),
    endDate: v.number(),
    dimension: v.optional(v.string()),
  },
  handler: async (ctx, { metricType, period, startDate, endDate, dimension }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Query metrics using the by_metric_period index and actor scoping
    const metrics = await ctx.db
      .query('analyticsMetrics')
      .withIndex('by_metric_period', (q) =>
        q.eq('metricType', metricType).eq('period', period)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('actorId'), user._id),
          q.gte(q.field('periodStart'), startDate),
          q.lte(q.field('periodEnd'), endDate),
          q.eq(q.field('deletedAt'), undefined),
          dimension ? q.eq(q.field('dimension'), dimension) : true
        )
      )
      .collect();

    // Transform to MetricData format
    return metrics.map((m) => ({
      periodStart: m.periodStart,
      periodEnd: m.periodEnd,
      count: m.count,
      sum: m.sum,
      average: m.average,
      min: m.min,
      max: m.max,
      breakdown: m.breakdown,
    }));
  },
});

/**
 * Get analytics summary statistics for a date range preset
 * Authentication: Required
 */
export const getAnalyticsSummary = query({
  args: {
    period: v.string(), // "today", "yesterday", "last_7_days", "last_30_days", etc.
  },
  handler: async (ctx, { period }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Calculate date range based on period
    const now = Date.now();
    let startDate: number;
    let endDate = now;

    switch (period) {
      case 'today':
        startDate = new Date().setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        endDate = new Date().setHours(0, 0, 0, 0);
        startDate = endDate - 24 * 60 * 60 * 1000;
        break;
      case 'last_7_days':
        startDate = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'last_30_days':
        startDate = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case 'last_90_days':
        startDate = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case 'this_month':
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        break;
      case 'last_month':
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).getTime();
        endDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
        break;
      case 'this_year':
        startDate = new Date(new Date().getFullYear(), 0, 1).getTime();
        break;
      default:
        startDate = now - 30 * 24 * 60 * 60 * 1000; // Default to last 30 days
    }

    // Get events in date range
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_actor_and_timestamp', (q) =>
        q.eq('actorId', user._id).gte('timestamp', startDate).lte('timestamp', endDate)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Calculate statistics
    const totalEvents = events.length;
    const pageViews = events.filter((e) => e.eventType === 'page_view').length;
    const uniqueUsers = new Set(events.map((e) => e.userId).filter(Boolean)).size;

    // Calculate average session duration (simplified - could be enhanced)
    const sessions = new Map<string, number[]>();
    events.forEach((e) => {
      if (!sessions.has(e.sessionId)) {
        sessions.set(e.sessionId, []);
      }
      sessions.get(e.sessionId)!.push(e.timestamp);
    });

    let totalDuration = 0;
    sessions.forEach((timestamps) => {
      if (timestamps.length > 1) {
        const sorted = timestamps.sort((a, b) => a - b);
        totalDuration += sorted[sorted.length - 1] - sorted[0];
      }
    });
    const avgSessionDuration = sessions.size > 0 ? totalDuration / sessions.size : 0;

    // Calculate events by type breakdown
    const eventsByType: Record<string, number> = {};
    events.forEach((e) => {
      eventsByType[e.eventType] = (eventsByType[e.eventType] || 0) + 1;
    });

    return {
      dateRange: {
        start: startDate,
        end: endDate,
      },
      totalEvents,
      pageViews: pageViews,
      uniqueUsers,
      activeSessions: sessions.size,
      eventsByType,
      avgSessionDuration: Math.round(avgSessionDuration / 1000), // Convert to seconds
    };
  },
});

/**
 * Get page views with optional filtering
 * Authentication: Required
 */
export const getPageViews = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    pagePath: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { startDate, endDate, pagePath, limit = 100 }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Query events using actor/timestamp index
    let pageViewEvents = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_actor_and_timestamp', (q) =>
        q.eq('actorId', user._id).gte('timestamp', startDate).lte('timestamp', endDate)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field('eventType'), 'page_view'),
          q.eq(q.field('deletedAt'), undefined),
          pagePath ? q.eq(q.field('pagePath'), pagePath) : true
        )
      )
      .collect();

    // Sort by timestamp descending
    pageViewEvents.sort((a, b) => b.timestamp - a.timestamp);

    // Apply limit
    const pageViews = pageViewEvents.slice(0, limit);

    return {
      pageViews,
      total: pageViewEvents.length,
      hasMore: pageViewEvents.length > limit,
    };
  },
});

/**
 * Get count of active sessions (sessions active in last 30 minutes)
 * Authentication: Required
 */
export const getActiveSessions = query({
  args: {},
  handler: async (ctx) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Get events from last 30 minutes
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    const recentEvents = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_actor_and_timestamp', (q) =>
        q.eq('actorId', user._id).gte('timestamp', thirtyMinutesAgo)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Count unique sessions
    const uniqueSessions = new Set(recentEvents.map((e) => e.sessionId));
    return uniqueSessions.size;
  },
});

/**
 * Get unique user count in date range
 * Authentication: Required
 */
export const getUniqueUsers = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, { startDate, endDate }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Query events in date range
    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_actor_and_timestamp', (q) =>
        q.eq('actorId', user._id).gte('timestamp', startDate).lte('timestamp', endDate)
      )
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Count unique user IDs (excluding anonymous users)
    const uniqueUsers = new Set(events.map((e) => e.userId).filter((id): id is Id<'userProfiles'> => id !== undefined));
    return uniqueUsers.size;
  },
});

/**
 * Get list of dashboards with filtering
 * Authentication: Required
 */
export const getDashboards = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('overview'),
        v.literal('ai_usage'),
        v.literal('payments'),
        v.literal('user_behavior'),
        v.literal('performance'),
        v.literal('custom')
      )
    ),
    includePublic: v.optional(v.boolean()),
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { type, includePublic = false, options = {} }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    const { limit = 50, offset = 0 } = options;

    // Query dashboards
    let allDashboards: Doc<'analyticsDashboards'>[] = [];

    if (type) {
      // Use type index if filtering by type
      allDashboards = await ctx.db
        .query('analyticsDashboards')
        .withIndex('by_type', (q) => q.eq('type', type))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    } else {
      // Full scan if no type filter
      allDashboards = await ctx.db
        .query('analyticsDashboards')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    // Filter by access
    const accessibleDashboards = filterDashboardsByAccess(allDashboards, user);

    // Sort by creation date descending
    accessibleDashboards.sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const total = accessibleDashboards.length;
    const paginatedDashboards = accessibleDashboards.slice(offset, offset + limit);

    return {
      dashboards: paginatedDashboards,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single dashboard by ID
 * Authentication: Required
 */
export const getDashboard = query({
  args: {
    dashboardId: v.id('analyticsDashboards'),
  },
  handler: async (ctx, { dashboardId }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Direct O(1) lookup
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard || dashboard.deletedAt) {
      return null;
    }

    // Check access
    const hasAccess = await canViewDashboard(ctx, user, dashboard);
    if (!hasAccess) {
      throw new Error('Permission denied: You do not have access to this dashboard');
    }

    return dashboard;
  },
});

/**
 * Get list of reports with filtering
 * Authentication: Required
 */
export const getReports = query({
  args: {
    reportType: v.optional(
      v.union(
        v.literal('usage_summary'),
        v.literal('cost_analysis'),
        v.literal('user_activity'),
        v.literal('performance'),
        v.literal('custom')
      )
    ),
    includePublic: v.optional(v.boolean()),
    options: v.optional(
      v.object({
        limit: v.optional(v.number()),
        offset: v.optional(v.number()),
      })
    ),
  },
  handler: async (ctx, { reportType, includePublic = false, options = {} }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    const { limit = 50, offset = 0 } = options;

    // Query reports
    let allReports: Doc<'analyticsReports'>[] = [];

    if (reportType) {
      // Use type index if filtering by reportType
      allReports = await ctx.db
        .query('analyticsReports')
        .withIndex('by_type', (q) => q.eq('reportType', reportType))
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    } else {
      // Full scan if no type filter
      allReports = await ctx.db
        .query('analyticsReports')
        .filter((q) => q.eq(q.field('deletedAt'), undefined))
        .collect();
    }

    // Filter by access
    const accessibleReports = filterReportsByAccess(allReports, user);

    // Sort by creation date descending
    accessibleReports.sort((a, b) => b.createdAt - a.createdAt);

    // Pagination
    const total = accessibleReports.length;
    const paginatedReports = accessibleReports.slice(offset, offset + limit);

    return {
      reports: paginatedReports,
      total,
      hasMore: total > offset + limit,
    };
  },
});

/**
 * Get single report by ID
 * Authentication: Required
 */
export const getReport = query({
  args: {
    reportId: v.id('analyticsReports'),
  },
  handler: async (ctx, { reportId }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Direct O(1) lookup
    const report = await ctx.db.get(reportId);
    if (!report || report.deletedAt) {
      return null;
    }

    // Check access
    const hasAccess = await canViewReport(ctx, user, report);
    if (!hasAccess) {
      throw new Error('Permission denied: You do not have access to this report');
    }

    return report;
  },
});

/**
 * Helper query: Get events by session
 * Authentication: Required
 */
export const getEventsBySession = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_session', (q) => q.eq('sessionId', sessionId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .collect();

    // Sort by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);

    return events;
  },
});

/**
 * Helper query: Get user events
 * Authentication: Required
 */
export const getUserEvents = query({
  args: {
    userId: v.optional(v.id('userProfiles')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { userId, limit = 100 }) => {
    // Require authentication
    const user = await requireCurrentUser(ctx);

    // Use requesting user's ID if not provided or if not admin
    const targetUserId = userId && (user.role === 'admin' || user.role === 'superadmin')
      ? userId
      : user._id;

    const events = await ctx.db
      .query('analyticsEvents')
      .withIndex('by_user_id', (q) => q.eq('userId', targetUserId))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .order('desc')
      .take(limit);

    return events;
  },
});

/**
 * Helper query: Get dashboard by slug (for public pages)
 * Authentication: Optional
 */
export const getDashboardBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, { slug }) => {
    // Optional authentication
    const user = await getCurrentUser(ctx);

    const dashboard = await ctx.db
      .query('analyticsDashboards')
      .withIndex('by_slug', (q) => q.eq('slug', slug))
      .filter((q) => q.eq(q.field('deletedAt'), undefined))
      .first();

    if (!dashboard) {
      return null;
    }

    // Check access
    if (dashboard.isPublic) {
      return dashboard;
    }

    if (!user) {
      throw new Error('Authentication required for private dashboard');
    }

    const hasAccess = await canViewDashboard(ctx, user, dashboard);
    if (!hasAccess) {
      throw new Error('Permission denied: You do not have access to this dashboard');
    }

    return dashboard;
  },
});
