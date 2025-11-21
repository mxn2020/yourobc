// convex/lib/system/analytics/analytics/mutations.ts
// Mutation functions for analytics module

import { v } from 'convex/values';
import { mutation, MutationCtx } from '@/generated/server';
import {
  generateSessionId,
  generateAnonymousId,
  hashIpAddress,
  parseUserAgent,
  sanitizeEventProperties,
  getPeriodBoundaries,
  generateAnalyticsPublicId,
} from './utils';
import { ANALYTICS_CONSTANTS } from './constants';
import { Id } from '@/generated/dataModel';
import { requireCurrentUser, requireOwnershipOrAdmin, requireAdmin } from '@/shared/auth.helper';
import type { EventProperties, DimensionBreakdown } from './types';

/**
 * Audit Actions
 */
const AUDIT_ACTIONS = {
  DASHBOARD_CREATED: 'analytics.dashboard.created',
  DASHBOARD_UPDATED: 'analytics.dashboard.updated',
  DASHBOARD_DELETED: 'analytics.dashboard.deleted',
  REPORT_CREATED: 'analytics.report.created',
  REPORT_UPDATED: 'analytics.report.updated',
  REPORT_DELETED: 'analytics.report.deleted',
  PROVIDER_CONFIG_CREATED: 'analytics.provider_config.created',
  PROVIDER_CONFIG_UPDATED: 'analytics.provider_config.updated',
  PROVIDER_SYNC_STATUS_UPDATED: 'analytics.provider_sync.status_updated',
} as const;

/**
 * Reusable validators for type-safe mutations
 */
const filterConditionValidator = v.object({
  field: v.string(),
  operator: v.union(
    v.literal('eq'),
    v.literal('neq'),
    v.literal('gt'),
    v.literal('lt'),
    v.literal('gte'),
    v.literal('lte'),
    v.literal('in'),
    v.literal('contains'),
    v.literal('startsWith'),
    v.literal('endsWith')
  ),
  value: v.union(v.string(), v.number(), v.boolean(), v.array(v.string()), v.array(v.number())),
});

const filtersValidator = v.object({
  conditions: v.array(filterConditionValidator),
  combinator: v.union(v.literal('and'), v.literal('or')),
});

const eventPropertiesValidator = v.union(
  v.object({ eventType: v.literal('page_view'), duration: v.optional(v.number()), scrollDepth: v.optional(v.number()), exitPage: v.optional(v.boolean()) }),
  v.object({ eventType: v.literal('user_action'), action: v.string(), category: v.optional(v.string()), label: v.optional(v.string()), target: v.optional(v.string()), buttonText: v.optional(v.string()), formId: v.optional(v.string()) }),
  v.object({ eventType: v.literal('ai_usage'), modelId: v.string(), modelName: v.string(), provider: v.string(), promptTokens: v.number(), completionTokens: v.number(), totalTokens: v.number(), cost: v.number(), latency: v.number(), success: v.boolean(), errorCode: v.optional(v.string()), errorMessage: v.optional(v.string()) }),
  v.object({ eventType: v.literal('payment'), transactionId: v.string(), amount: v.number(), currency: v.string(), paymentMethod: v.string(), status: v.union(v.literal('pending'), v.literal('completed'), v.literal('failed'), v.literal('refunded')), subscriptionId: v.optional(v.string()), planName: v.optional(v.string()) }),
  v.object({ eventType: v.literal('error'), errorType: v.string(), errorMessage: v.string(), errorStack: v.optional(v.string()), statusCode: v.optional(v.number()), url: v.optional(v.string()), componentName: v.optional(v.string()), severity: v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')) }),
  v.object({ eventType: v.literal('custom'), category: v.string(), data: v.record(v.string(), v.union(v.string(), v.number(), v.boolean())) })
);

const widgetConfigValidator = v.union(
  v.object({ type: v.literal('line_chart'), showLegend: v.optional(v.boolean()), showGrid: v.optional(v.boolean()), colors: v.optional(v.array(v.string())), smooth: v.optional(v.boolean()), stacked: v.optional(v.boolean()) }),
  v.object({ type: v.literal('bar_chart'), showLegend: v.optional(v.boolean()), showGrid: v.optional(v.boolean()), colors: v.optional(v.array(v.string())), horizontal: v.optional(v.boolean()), stacked: v.optional(v.boolean()) }),
  v.object({ type: v.literal('pie_chart'), showLegend: v.optional(v.boolean()), showValues: v.optional(v.boolean()), colors: v.optional(v.array(v.string())), donut: v.optional(v.boolean()) }),
  v.object({ type: v.literal('metric'), showTrend: v.optional(v.boolean()), showComparison: v.optional(v.boolean()), format: v.optional(v.union(v.literal('number'), v.literal('currency'), v.literal('percentage'))), precision: v.optional(v.number()) }),
  v.object({ type: v.literal('table'), showPagination: v.optional(v.boolean()), pageSize: v.optional(v.number()), sortable: v.optional(v.boolean()), columns: v.optional(v.array(v.object({ key: v.string(), label: v.string(), format: v.optional(v.union(v.literal('number'), v.literal('currency'), v.literal('percentage'), v.literal('date'))) }))) }),
  v.object({ type: v.literal('heatmap'), colorScheme: v.optional(v.union(v.literal('blue'), v.literal('green'), v.literal('red'), v.literal('purple'))), showValues: v.optional(v.boolean()) })
);

/**
 * Helper to get current user (returns null if not authenticated)
 */
async function getCurrentUser(ctx: MutationCtx) {
  try {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    
    const authUserId = identity.subject;
    
    const userProfile = await ctx.db
      .query('userProfiles')
      .withIndex('by_auth_user_id', (q) => q.eq('authUserId', authUserId))
      .first();

    return userProfile;
  } catch {
    return null;
  }
}

/**
 * Helper function to insert an analytics event
 */
async function insertAnalyticsEvent(
  ctx: MutationCtx,
  args: {
    eventName: string;
    eventType: 'page_view' | 'user_action' | 'ai_usage' | 'payment' | 'error' | 'custom';
    userId?: Id<'userProfiles'>;
    sessionId?: string;
    anonymousId?: string;
    properties?: EventProperties;
    value?: number;
    currency?: string;
    pageUrl: string;
    pagePath: string;
    pageTitle?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    timezone?: string;
  }
): Promise<Id<'analyticsEvents'>> {
  const now = Date.now();

  // Trim string fields
  const eventName = args.eventName.trim();
  const sessionId = (args.sessionId || generateSessionId()).trim();
  const anonymousId = (args.anonymousId || (!args.userId ? generateAnonymousId() : undefined))?.trim();
  const currency = args.currency?.trim();
  const pageUrl = args.pageUrl.trim();
  const pagePath = args.pagePath.trim();
  const pageTitle = args.pageTitle?.trim();
  const referrer = args.referrer?.trim();
  const userAgent = args.userAgent?.trim();
  const country = args.country?.trim();
  const city = args.city?.trim();
  const timezone = args.timezone?.trim();

  // Parse user agent
  const deviceInfo = userAgent ? parseUserAgent(userAgent) : undefined;

  // Hash IP address for privacy
  const hashedIp = args.ipAddress ? hashIpAddress(args.ipAddress) : undefined;

  // Sanitize properties
  const sanitizedProperties = args.properties
    ? (sanitizeEventProperties(args.properties as any) as EventProperties)
    : undefined;

  // Create event
  const eventId = await ctx.db.insert('analyticsEvents', {
    eventName,
    eventType: args.eventType,
    userId: args.userId,
    sessionId,
    anonymousId,
    properties: sanitizedProperties,
    value: args.value,
    currency,
    pageUrl,
    pagePath,
    pageTitle,
    referrer,
    userAgent,
    deviceType: deviceInfo?.deviceType,
    browser: deviceInfo?.browser,
    os: deviceInfo?.os,
    ipAddress: hashedIp,
    country,
    city,
    timezone,
    provider: 'internal',
    syncStatus: 'pending',
    timestamp: now,
    metadata: {
      source: 'analytics_service',
      operation: 'track_event',
    },
    createdAt: now,
    updatedAt: now,
    createdBy: args.userId,
    updatedBy: args.userId,
  });

  return eventId;
}

/**
 * Helper function to upsert a metric
 */
async function upsertMetricHelper(
  ctx: MutationCtx,
  args: {
    metricType: string;
    period: 'hour' | 'day' | 'week' | 'month';
    periodStart: number;
    periodEnd: number;
    dimension?: string;
    count: number;
    sum?: number;
    average?: number;
    min?: number;
    max?: number;
    breakdown?: DimensionBreakdown;
    metadata?: Record<string, string | number | boolean>;
    userId?: Id<'userProfiles'>;
  }
): Promise<Id<'analyticsMetrics'>> {
  const now = Date.now();

  // Trim string fields
  const metricType = args.metricType.trim();
  const dimension = args.dimension?.trim();

  // Check if metric already exists
  const existingMetrics = await ctx.db
    .query('analyticsMetrics')
    .withIndex('by_metric_period', (q) =>
      q
        .eq('metricType', metricType)
        .eq('period', args.period)
        .eq('periodStart', args.periodStart)
    )
    .collect();

  const existing = dimension
    ? existingMetrics.find((m) => m.dimension === dimension)
    : existingMetrics.find((m) => !m.dimension);

  if (existing) {
    // Update existing metric
    await ctx.db.patch(existing._id, {
      count: args.count,
      sum: args.sum,
      average: args.average,
      min: args.min,
      max: args.max,
      breakdown: args.breakdown,
      metadata: args.metadata,
      updatedAt: now,
      updatedBy: args.userId,
    });
    return existing._id;
  } else {
    // Create new metric
    return await ctx.db.insert('analyticsMetrics', {
      metricType,
      period: args.period,
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      dimension,
      count: args.count,
      sum: args.sum,
      average: args.average,
      min: args.min,
      max: args.max,
      breakdown: args.breakdown,
      metadata: args.metadata,
      createdAt: now,
      updatedAt: now,
      createdBy: args.userId,
      updatedBy: args.userId,
    });
  }
}

/**
 * Track an analytics event
 * 🔒 Authentication: Optional (supports anonymous tracking)
 */
export const trackEvent = mutation({
  args: {
    eventName: v.string(),
    eventType: v.union(
      v.literal('page_view'),
      v.literal('user_action'),
      v.literal('ai_usage'),
      v.literal('payment'),
      v.literal('error'),
      v.literal('custom')
    ),
    sessionId: v.optional(v.string()),
    anonymousId: v.optional(v.string()),
    properties: v.optional(eventPropertiesValidator),
    value: v.optional(v.number()),
    currency: v.optional(v.string()),
    pageUrl: v.string(),
    pagePath: v.string(),
    pageTitle: v.optional(v.string()),
    referrer: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    country: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user (may be null for anonymous tracking)
    const user = await getCurrentUser(ctx);

    return await insertAnalyticsEvent(ctx, {
      ...args,
      userId: user?._id,
    });
  },
});

/**
 * Track a page view (convenience method)
 * 🔒 Authentication: Optional (supports anonymous tracking)
 */
export const trackPageView = mutation({
  args: {
    pageUrl: v.string(),
    pagePath: v.string(),
    pageTitle: v.optional(v.string()),
    referrer: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Get current user (may be null for anonymous tracking)
    const user = await getCurrentUser(ctx);

    return await insertAnalyticsEvent(ctx, {
      ...args,
      eventName: 'page_view',
      eventType: 'page_view',
      userId: user?._id,
    });
  },
});

/**
 * Create or update an aggregated metric
 * 🔒 Authentication: Required (internal use)
 */
export const upsertMetric = mutation({
  args: {
    metricType: v.string(),
    period: v.union(
      v.literal('hour'),
      v.literal('day'),
      v.literal('week'),
      v.literal('month')
    ),
    periodStart: v.number(),
    periodEnd: v.number(),
    dimension: v.optional(v.string()),
    count: v.number(),
    sum: v.optional(v.number()),
    average: v.optional(v.number()),
    min: v.optional(v.number()),
    max: v.optional(v.number()),
    breakdown: v.optional(v.record(v.string(), v.number())),
    metadata: v.optional(v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))),
  },
  handler: async (ctx, args) => {
    // Get current user (optional for internal use)
    const user = await getCurrentUser(ctx);

    return await upsertMetricHelper(ctx, {
      ...args,
      userId: user?._id,
    });
  },
});

/**
 * Create a new dashboard
 * 🔒 Authentication: Required
 */
export const createDashboard = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    type: v.union(
      v.literal('overview'),
      v.literal('ai_usage'),
      v.literal('payments'),
      v.literal('user_behavior'),
      v.literal('performance'),
      v.literal('custom')
    ),
    widgets: v.array(
      v.object({
        id: v.string(),
        type: v.union(
          v.literal('line_chart'),
          v.literal('bar_chart'),
          v.literal('pie_chart'),
          v.literal('metric'),
          v.literal('table'),
          v.literal('heatmap')
        ),
        title: v.string(),
        query: v.object({
          metricType: v.string(),
          dimension: v.optional(v.string()),
          filters: v.optional(filtersValidator),
          dateRange: v.optional(
            v.object({
              start: v.number(),
              end: v.number(),
            })
          ),
        }),
        position: v.object({
          x: v.number(),
          y: v.number(),
          width: v.number(),
          height: v.number(),
        }),
        config: v.optional(widgetConfigValidator),
      })
    ),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const name = args.name.trim();
    const slug = args.slug.trim();
    const description = args.description?.trim();
    const ownerName = (user.name || user.email || 'Unknown').trim();

    const now = Date.now();

    // 3. Generate public ID
    const publicId = generateAnalyticsPublicId('dash');

    // 4. Create dashboard
    const dashboardId = await ctx.db.insert('analyticsDashboards', {
      name,
      publicId,
      slug,
      description,
      type: args.type,
      widgets: args.widgets,
      isPublic: args.isPublic,
      ownerId: user._id,
      ownerName,
      status: 'active',
      metadata: {
        source: 'dashboard_mutation',
        operation: 'create',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName: ownerName,
      action: AUDIT_ACTIONS.DASHBOARD_CREATED,
      entityType: 'analytics_dashboard',
      entityId: dashboardId,
      entityTitle: name,
      description: `Created analytics dashboard: ${name}`,
      metadata: {
        slug,
        type: args.type,
        isPublic: args.isPublic,
        widgetCount: args.widgets.length,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return dashboard ID
    return dashboardId;
  },
});

/**
 * Update a dashboard
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateDashboard = mutation({
  args: {
    dashboardId: v.id('analyticsDashboards'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      widgets: v.optional(
        v.array(
          v.object({
            id: v.string(),
            type: v.union(
              v.literal('line_chart'),
              v.literal('bar_chart'),
              v.literal('pie_chart'),
              v.literal('metric'),
              v.literal('table'),
              v.literal('heatmap')
            ),
            title: v.string(),
            query: v.object({
              metricType: v.string(),
              dimension: v.optional(v.string()),
              filters: v.optional(filtersValidator),
              dateRange: v.optional(
                v.object({
                  start: v.number(),
                  end: v.number(),
                })
              ),
            }),
            position: v.object({
              x: v.number(),
              y: v.number(),
              width: v.number(),
              height: v.number(),
            }),
            config: v.optional(widgetConfigValidator),
          })
        )
      ),
      isPublic: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, { dashboardId, updates }) => {
    // 1. Get dashboard
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, dashboard.ownerId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
    };

    const now = Date.now();
    const userName = (user.name || user.email || 'Unknown').trim();

    // 4. Update dashboard
    await ctx.db.patch(dashboardId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: AUDIT_ACTIONS.DASHBOARD_UPDATED,
      entityType: 'analytics_dashboard',
      entityId: dashboardId,
      entityTitle: trimmedUpdates.name || dashboard.name,
      description: `Updated analytics dashboard: ${dashboard.name}`,
      metadata: {
        updatedFields: Object.keys(updates),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Return dashboard ID
    return dashboardId;
  },
});

/**
 * Delete a dashboard (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteDashboard = mutation({
  args: {
    dashboardId: v.id('analyticsDashboards'),
  },
  handler: async (ctx, { dashboardId }) => {
    // 1. Get dashboard
    const dashboard = await ctx.db.get(dashboardId);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, dashboard.ownerId);

    const now = Date.now();
    const userName = (user.name || user.email || 'Unknown').trim();

    // 3. Soft delete dashboard
    await ctx.db.patch(dashboardId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: AUDIT_ACTIONS.DASHBOARD_DELETED,
      entityType: 'analytics_dashboard',
      entityId: dashboardId,
      entityTitle: dashboard.name,
      description: `Deleted analytics dashboard: ${dashboard.name}`,
      metadata: {
        slug: dashboard.slug,
        type: dashboard.type,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return success
    return true;
  },
});

/**
 * Create a new report
 * 🔒 Authentication: Required
 */
export const createReport = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    reportType: v.union(
      v.literal('usage_summary'),
      v.literal('cost_analysis'),
      v.literal('user_activity'),
      v.literal('performance'),
      v.literal('custom')
    ),
    query: v.object({
      metrics: v.array(v.string()),
      dimensions: v.optional(v.array(v.string())),
      filters: v.optional(filtersValidator),
      dateRange: v.object({
        start: v.number(),
        end: v.number(),
      }),
    }),
    schedule: v.optional(
      v.object({
        enabled: v.boolean(),
        frequency: v.union(
          v.literal('daily'),
          v.literal('weekly'),
          v.literal('monthly')
        ),
        time: v.string(),
        recipients: v.array(v.string()),
        lastRun: v.optional(v.number()),
        nextRun: v.optional(v.number()),
      })
    ),
    exportFormats: v.array(
      v.union(v.literal('csv'), v.literal('json'), v.literal('pdf'))
    ),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    // 1. Authentication
    const user = await requireCurrentUser(ctx);

    // 2. Trim string fields
    const name = args.name.trim();
    const description = args.description?.trim();
    const userName = (user.name || user.email || 'Unknown').trim();

    const now = Date.now();

    // 3. Generate public ID
    const publicId = generateAnalyticsPublicId('rep');

    // 4. Create report
    const reportId = await ctx.db.insert('analyticsReports', {
      name,
      publicId,
      description,
      reportType: args.reportType,
      query: args.query,
      schedule: args.schedule,
      exportFormats: args.exportFormats,
      ownerId: user._id,
      isPublic: args.isPublic,
      status: args.schedule?.enabled ? 'scheduled' : 'active',
      metadata: {
        source: 'report_mutation',
        operation: 'create',
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: AUDIT_ACTIONS.REPORT_CREATED,
      entityType: 'analytics_report',
      entityId: reportId,
      entityTitle: name,
      description: `Created analytics report: ${name}`,
      metadata: {
        reportType: args.reportType,
        isPublic: args.isPublic,
        exportFormats: args.exportFormats,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return report ID
    return reportId;
  },
});

/**
 * Update a report
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const updateReport = mutation({
  args: {
    reportId: v.id('analyticsReports'),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      query: v.optional(
        v.object({
          metrics: v.array(v.string()),
          dimensions: v.optional(v.array(v.string())),
          filters: v.optional(filtersValidator),
          dateRange: v.object({
            start: v.number(),
            end: v.number(),
          }),
        })
      ),
      schedule: v.optional(
        v.object({
          enabled: v.boolean(),
          frequency: v.union(
            v.literal('daily'),
            v.literal('weekly'),
            v.literal('monthly')
          ),
          time: v.string(),
          recipients: v.array(v.string()),
          lastRun: v.optional(v.number()),
          nextRun: v.optional(v.number()),
        })
      ),
      lastResult: v.optional(
        v.object({
          data: v.array(
            v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
          ),
          generatedAt: v.number(),
          rowCount: v.number(),
        })
      ),
    }),
  },
  handler: async (ctx, { reportId, updates }) => {
    // 1. Get report
    const report = await ctx.db.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, report.ownerId);

    // 3. Trim string fields in updates
    const trimmedUpdates = {
      ...updates,
      name: updates.name?.trim(),
      description: updates.description?.trim(),
    };

    const now = Date.now();
    const userName = (user.name || user.email || 'Unknown').trim();

    // 4. Update report
    await ctx.db.patch(reportId, {
      ...trimmedUpdates,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: AUDIT_ACTIONS.REPORT_UPDATED,
      entityType: 'analytics_report',
      entityId: reportId,
      entityTitle: trimmedUpdates.name || report.name,
      description: `Updated analytics report: ${report.name}`,
      metadata: {
        updatedFields: Object.keys(updates),
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 6. Return report ID
    return reportId;
  },
});

/**
 * Delete a report (soft delete)
 * 🔒 Authentication: Required
 * 🔒 Authorization: Owner or admin only
 */
export const deleteReport = mutation({
  args: {
    reportId: v.id('analyticsReports'),
  },
  handler: async (ctx, { reportId }) => {
    // 1. Get report
    const report = await ctx.db.get(reportId);
    if (!report) {
      throw new Error('Report not found');
    }

    // 2. Check ownership
    const user = await requireOwnershipOrAdmin(ctx, report.ownerId);

    const now = Date.now();
    const userName = (user.name || user.email || 'Unknown').trim();

    // 3. Soft delete report
    await ctx.db.patch(reportId, {
      deletedAt: now,
      deletedBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 4. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: user._id,
      userName,
      action: AUDIT_ACTIONS.REPORT_DELETED,
      entityType: 'analytics_report',
      entityId: reportId,
      entityTitle: report.name,
      description: `Deleted analytics report: ${report.name}`,
      metadata: {
        reportType: report.reportType,
      },
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });

    // 5. Return success
    return true;
  },
});

/**
 * Create or update provider configuration
 * 🔒 Authentication: Required
 * 🔒 Authorization: Admin only
 */
export const upsertProviderConfig = mutation({
  args: {
    provider: v.string(),
    enabled: v.boolean(),
    config: v.union(
      v.object({
        provider: v.literal('google_analytics'),
        measurementId: v.string(),
        apiSecret: v.string(),
        propertyId: v.optional(v.string()),
      }),
      v.object({
        provider: v.literal('mixpanel'),
        token: v.string(),
        apiSecret: v.optional(v.string()),
        projectId: v.optional(v.string()),
      }),
      v.object({
        provider: v.literal('plausible'),
        domain: v.string(),
        apiKey: v.optional(v.string()),
      }),
      v.object({
        provider: v.literal('internal'),
        enableBatching: v.optional(v.boolean()),
        batchSize: v.optional(v.number()),
      })
    ),
    autoSync: v.boolean(),
    syncDirection: v.union(
      v.literal('export'),
      v.literal('import'),
      v.literal('bidirectional')
    ),
    eventMappings: v.optional(
      v.array(
        v.object({
          internalEvent: v.string(),
          externalEvent: v.string(),
          transform: v.optional(
            v.array(
              v.object({
                sourceField: v.string(),
                targetField: v.string(),
                transformType: v.union(
                  v.literal('rename'),
                  v.literal('map'),
                  v.literal('compute'),
                  v.literal('filter')
                ),
                mapping: v.optional(
                  v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))
                ),
                computeExpression: v.optional(v.string()),
              })
            )
          ),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication & Authorization
    const admin = await requireAdmin(ctx);

    // 2. Trim string fields
    const provider = args.provider.trim();
    const adminName = (admin.name || admin.email || 'Admin').trim();

    const now = Date.now();

    // 3. Check if config exists
    const existing = await ctx.db
      .query('analyticsProviderSync')
      .withIndex('by_provider', (q) => q.eq('provider', provider))
      .first();

    let configId: Id<'analyticsProviderSync'>;
    let action: string;

    if (existing) {
      // 4a. Update existing
      await ctx.db.patch(existing._id, {
        enabled: args.enabled,
        config: args.config,
        autoSync: args.autoSync,
        syncDirection: args.syncDirection,
        eventMappings: args.eventMappings,
        updatedAt: now,
        updatedBy: admin._id,
      });
      configId = existing._id;
      action = AUDIT_ACTIONS.PROVIDER_CONFIG_UPDATED;
    } else {
      // 4b. Create new
      const publicId = generateAnalyticsPublicId('prov');
      configId = await ctx.db.insert('analyticsProviderSync', {
        provider,
        publicId,
        enabled: args.enabled,
        config: args.config,
        autoSync: args.autoSync,
        syncDirection: args.syncDirection,
        eventMappings: args.eventMappings,
        status: args.enabled ? 'active' : 'inactive',
        metadata: {
          source: 'provider_config_mutation',
          operation: 'create',
        },
        createdAt: now,
        createdBy: admin._id,
        updatedAt: now,
        updatedBy: admin._id,
      });
      action = AUDIT_ACTIONS.PROVIDER_CONFIG_CREATED;
    }

    // 5. Create audit log
    await ctx.db.insert('auditLogs', {
      userId: admin._id,
      userName: adminName,
      action,
      entityType: 'analytics_provider_config',
      entityId: configId,
      entityTitle: `${provider} provider config`,
      description: `${existing ? 'Updated' : 'Created'} analytics provider config: ${provider}`,
      metadata: {
        provider,
        enabled: args.enabled,
        autoSync: args.autoSync,
        syncDirection: args.syncDirection,
      },
      createdAt: now,
      createdBy: admin._id,
      updatedAt: now,
      updatedBy: admin._id,
    });

    // 6. Return config ID
    return configId;
  },
});

/**
 * Update provider sync status
 * 🔒 Authentication: Required (internal use)
 */
export const updateProviderSyncStatus = mutation({
  args: {
    provider: v.string(),
    lastSyncStatus: v.union(
      v.literal('success'),
      v.literal('partial'),
      v.literal('error')
    ),
    lastSyncError: v.optional(v.string()),
    eventsSynced: v.optional(v.number()),
    eventsSkipped: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const provider = args.provider.trim();
    const lastSyncError = args.lastSyncError?.trim();

    // 2. Get config
    const config = await ctx.db
      .query('analyticsProviderSync')
      .withIndex('by_provider', (q) => q.eq('provider', provider))
      .first();

    if (!config) {
      throw new Error(`Provider config not found: ${provider}`);
    }

    // 3. Get current user for audit trail
    const user = await getCurrentUser(ctx);

    const now = Date.now();

    // 4. Update provider sync status
    await ctx.db.patch(config._id, {
      lastSyncedAt: now,
      lastSyncStatus: args.lastSyncStatus,
      lastSyncError,
      eventsSynced: args.eventsSynced,
      eventsSkipped: args.eventsSkipped,
      updatedAt: now,
      updatedBy: user?._id,
    });

    // 5. Create audit log
    const userName = user ? (user.name || user.email || 'System').trim() : 'System';
    await ctx.db.insert('auditLogs', {
      userId: user?._id,
      userName,
      action: AUDIT_ACTIONS.PROVIDER_SYNC_STATUS_UPDATED,
      entityType: 'analytics_provider_config',
      entityId: config._id,
      entityTitle: `${provider} provider sync`,
      description: `Updated ${provider} sync status: ${args.lastSyncStatus}`,
      metadata: {
        provider,
        lastSyncStatus: args.lastSyncStatus,
        lastSyncError: lastSyncError ?? null,
        eventsSynced: args.eventsSynced ?? 0,
        eventsSkipped: args.eventsSkipped ?? 0,
      },
      createdAt: now,
      createdBy: user?._id,
      updatedAt: now,
      updatedBy: user?._id,
    });

    // 6. Return success
    return true;
  },
});

/**
 * Mark events as synced to external provider
 * 🔒 Authentication: Required (internal use)
 */
export const markEventsSynced = mutation({
  args: {
    eventIds: v.array(v.id('analyticsEvents')),
    provider: v.string(),
    externalEventIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // 1. Trim string fields
    const provider = args.provider.trim();
    const externalEventIds = args.externalEventIds?.map(id => id.trim());

    // 2. Get current user for audit trail
    const user = await getCurrentUser(ctx);

    const now = Date.now();

    // 3. Mark events as synced
    for (let i = 0; i < args.eventIds.length; i++) {
      const eventId = args.eventIds[i];
      const externalId = externalEventIds?.[i];

      await ctx.db.patch(eventId, {
        provider,
        externalEventId: externalId,
        syncedAt: now,
        syncStatus: 'synced',
        updatedAt: now,
        updatedBy: user?._id,
      });
    }

    // 4. Return success
    return true;
  },
});