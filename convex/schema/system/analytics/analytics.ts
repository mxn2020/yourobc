// convex/schema/system/analytics/analytics.ts
// Table definitions for analytics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { analyticsValidators } from './validators';
import { baseValidators } from '@/schema/base.validators';

/**
 * Analytics Events Table
 * Stores all tracked events (page views, user actions, AI usage, payments, etc.)
 */
export const analyticsEventsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Event Identity
  eventName: v.string(), // 'page_view', 'button_click', 'ai_request', etc.
  eventType: analyticsValidators.eventType,

  // User Context
  userId: v.optional(v.id('userProfiles')),
  sessionId: v.string(),
  anonymousId: v.optional(v.string()), // For non-logged-in users

  // Event Data - Discriminated union by eventType
  properties: v.optional(
    v.union(
      // PageViewProperties
      v.object({
        eventType: v.literal('page_view'),
        duration: v.optional(v.number()),
        scrollDepth: v.optional(v.number()),
        exitPage: v.optional(v.boolean()),
      }),
      // UserActionProperties
      v.object({
        eventType: v.literal('user_action'),
        action: v.string(),
        category: v.optional(v.string()),
        label: v.optional(v.string()),
        target: v.optional(v.string()),
        buttonText: v.optional(v.string()),
        formId: v.optional(v.string()),
      }),
      // AIUsageProperties
      v.object({
        eventType: v.literal('ai_usage'),
        modelId: v.string(),
        modelName: v.string(),
        provider: v.string(),
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
        cost: v.number(),
        latency: v.number(),
        success: v.boolean(),
        errorCode: v.optional(v.string()),
        errorMessage: v.optional(v.string()),
      }),
      // PaymentProperties
      v.object({
        eventType: v.literal('payment'),
        transactionId: v.string(),
        amount: v.number(),
        currency: v.string(),
        paymentMethod: baseValidators.paymentMethod,
        status: analyticsValidators.paymentStatus,
        subscriptionId: v.optional(v.string()),
        planName: v.optional(v.string()),
      }),
      // ErrorProperties
      v.object({
        eventType: v.literal('error'),
        errorType: v.string(),
        errorMessage: v.string(),
        errorStack: v.optional(v.string()),
        statusCode: v.optional(v.number()),
        url: v.optional(v.string()),
        componentName: v.optional(v.string()),
        severity: analyticsValidators.errorSeverity,
      }),
      // CustomProperties
      v.object({
        eventType: v.literal('custom'),
        category: v.string(),
        data: v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
      })
    )
  ),
  value: v.optional(v.number()), // Monetary or numeric value
  currency: v.optional(v.string()), // For monetary events

  // Page Context
  pageUrl: v.string(),
  pagePath: v.string(),
  pageTitle: v.optional(v.string()),
  referrer: v.optional(v.string()),

  // Device & Browser
  userAgent: v.optional(v.string()),
  deviceType: v.optional(analyticsValidators.deviceType),
  browser: v.optional(v.string()),
  os: v.optional(v.string()),

  // Location
  ipAddress: v.optional(v.string()), // Hashed for privacy
  country: v.optional(v.string()),
  city: v.optional(v.string()),
  timezone: v.optional(v.string()),

  // External Provider Sync
  provider: v.optional(v.string()), // 'internal', 'google_analytics', 'mixpanel', 'plausible'
  externalEventId: v.optional(v.string()),
  syncedAt: v.optional(v.number()),
  syncStatus: v.optional(analyticsValidators.syncStatus),

  // Timestamps
  timestamp: v.number(),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_event_name', ['eventName'])
  .index('by_event_type', ['eventType'])
  .index('by_user', ['userId'])
  .index('by_session', ['sessionId'])
  .index('by_timestamp', ['timestamp'])
  .index('by_owner_and_timestamp', ['ownerId', 'timestamp'])
  .index('by_user_timestamp', ['userId', 'timestamp'])
  .index('by_sync_status', ['syncStatus'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);

/**
 * Analytics Metrics Table
 * Stores pre-aggregated metrics for faster querying
 */
export const analyticsMetricsTable = defineTable({
  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Metric Identity
  metricType: v.string(), // 'daily_active_users', 'ai_requests_count', etc.
  dimension: v.optional(v.string()), // 'country:US', 'feature:chat', etc.

  // Time Bucket
  period: analyticsValidators.metricPeriod,
  periodStart: v.number(),
  periodEnd: v.number(),

  // Metric Values
  count: v.number(),
  sum: v.optional(v.number()),
  average: v.optional(v.number()),
  min: v.optional(v.number()),
  max: v.optional(v.number()),

  // Breakdown (for dimensions) - key: dimension value, value: metric count
  breakdown: v.optional(v.record(v.string(), v.number())),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_metric_period', ['metricType', 'period', 'periodStart'])
  .index('by_metric_owner', ['metricType', 'ownerId'])
  .index('by_period_start', ['periodStart'])
  .index('by_metric_dimension', ['metricType', 'dimension'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);

/**
 * Analytics Dashboards Table
 * Custom dashboards with configurable widgets
 */
export const analyticsDashboardsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  slug: v.string(),
  ownerId: v.id('userProfiles'),
  ownerName: v.string(),

  // Dashboard information
  description: v.optional(v.string()),

  // Dashboard Type
  type: analyticsValidators.dashboardType,

  // Dashboard Config
  widgets: v.array(
    v.object({
      id: v.string(),
      type: analyticsValidators.widgetType,
      title: v.string(),
      query: v.object({
        metricType: v.string(),
        dimension: v.optional(v.string()),
        filters: v.optional(
          v.object({
            conditions: v.array(
              v.object({
                field: v.string(),
                operator: analyticsValidators.filterOperator,
                value: v.union(
                  v.string(),
                  v.number(),
                  v.boolean(),
                  v.array(v.string()),
                  v.array(v.number())
                ),
              })
            ),
            combinator: v.union(v.literal('and'), v.literal('or')),
          })
        ),
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
      config: v.optional(
        v.union(
          // LineChartConfig
          v.object({
            type: v.literal('line_chart'),
            showLegend: v.optional(v.boolean()),
            showGrid: v.optional(v.boolean()),
            colors: v.optional(v.array(v.string())),
            smooth: v.optional(v.boolean()),
            stacked: v.optional(v.boolean()),
          }),
          // BarChartConfig
          v.object({
            type: v.literal('bar_chart'),
            showLegend: v.optional(v.boolean()),
            showGrid: v.optional(v.boolean()),
            colors: v.optional(v.array(v.string())),
            horizontal: v.optional(v.boolean()),
            stacked: v.optional(v.boolean()),
          }),
          // PieChartConfig
          v.object({
            type: v.literal('pie_chart'),
            showLegend: v.optional(v.boolean()),
            showValues: v.optional(v.boolean()),
            colors: v.optional(v.array(v.string())),
            donut: v.optional(v.boolean()),
          }),
          // MetricConfig
          v.object({
            type: v.literal('metric'),
            showTrend: v.optional(v.boolean()),
            showComparison: v.optional(v.boolean()),
            format: v.optional(analyticsValidators.chartFormat),
            precision: v.optional(v.number()),
          }),
          // TableConfig
          v.object({
            type: v.literal('table'),
            showPagination: v.optional(v.boolean()),
            pageSize: v.optional(v.number()),
            sortable: v.optional(v.boolean()),
            columns: v.optional(
              v.array(
                v.object({
                  key: v.string(),
                  label: v.string(),
                  format: v.optional(analyticsValidators.chartFormat),
                })
              )
            ),
          }),
          // HeatmapConfig
          v.object({
            type: v.literal('heatmap'),
            colorScheme: v.optional(analyticsValidators.colorScheme),
            showValues: v.optional(v.boolean()),
          })
        )
      ),
    })
  ),

  // Access Control
  isPublic: v.boolean(),
  status: v.union(v.literal('active'), v.literal('archived')),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_slug', ['slug'])
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_owner_id', ['ownerId'])
  .index('by_owner_and_type', ['ownerId', 'type'])
  .index('by_public', ['isPublic'])
  .index('by_status', ['status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);

/**
 * Analytics Reports Table
 * Scheduled and saved reports
 */
export const analyticsReportsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  status: v.union(v.literal('active'), v.literal('archived'), v.literal('scheduled')),

  // Report information
  description: v.optional(v.string()),

  // Report Configuration
  reportType: analyticsValidators.reportType,
  query: v.object({
    metrics: v.array(v.string()),
    dimensions: v.optional(v.array(v.string())),
    filters: v.optional(
      v.object({
        conditions: v.array(
          v.object({
            field: v.string(),
            operator: analyticsValidators.filterOperator,
            value: v.union(
              v.string(),
              v.number(),
              v.boolean(),
              v.array(v.string()),
              v.array(v.number())
            ),
          })
        ),
        combinator: v.union(v.literal('and'), v.literal('or')),
      })
    ),
    dateRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
  }),

  // Scheduling
  schedule: v.optional(
    v.object({
      enabled: v.boolean(),
      frequency: analyticsValidators.reportFrequency,
      time: v.string(), // HH:mm format
      recipients: v.array(v.string()), // Email addresses
      lastRun: v.optional(v.number()),
      nextRun: v.optional(v.number()),
    })
  ),

  // Results - data is array of metric rows
  lastResult: v.optional(
    v.object({
      data: v.array(
        v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
      ),
      generatedAt: v.number(),
      rowCount: v.number(),
    })
  ),

  // Export Format
  exportFormats: v.array(analyticsValidators.exportFormat),

  // Access Control
  isPublic: v.boolean(),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_type', ['reportType'])
  .index('by_status', ['status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);

/**
 * Analytics Provider Sync Table
 * Configuration for external analytics providers
 */
export const analyticsProviderSyncTable = defineTable({
  // Required: Main display field
  provider: v.string(), // 'google_analytics', 'mixpanel', 'plausible'

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  ownerName: v.string(),
  status: v.union(v.literal('active'), v.literal('inactive'), v.literal('error')),

  // Configuration - Discriminated union by provider
  enabled: v.boolean(),
  config: v.union(
    // GoogleAnalyticsConfig
    v.object({
      provider: v.literal('google_analytics'),
      measurementId: v.string(),
      apiSecret: v.string(),
      propertyId: v.optional(v.string()),
    }),
    // MixpanelConfig
    v.object({
      provider: v.literal('mixpanel'),
      token: v.string(),
      apiSecret: v.optional(v.string()),
      projectId: v.optional(v.string()),
    }),
    // PlausibleConfig
    v.object({
      provider: v.literal('plausible'),
      domain: v.string(),
      apiKey: v.optional(v.string()),
    }),
    // InternalConfig
    v.object({
      provider: v.literal('internal'),
      enableBatching: v.optional(v.boolean()),
      batchSize: v.optional(v.number()),
    })
  ),

  // Sync Settings
  autoSync: v.boolean(),
  syncDirection: analyticsValidators.syncDirection,

  // Event Mapping
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
              transformType: analyticsValidators.transformType,
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

  // Sync Status
  lastSyncedAt: v.optional(v.number()),
  lastSyncStatus: v.optional(analyticsValidators.lastSyncStatus),
  lastSyncError: v.optional(v.string()),
  eventsSynced: v.optional(v.number()),
  eventsSkipped: v.optional(v.number()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_provider', ['provider'])
  .index('by_owner_and_provider', ['ownerId', 'provider'])
  .index('by_enabled', ['enabled'])
  .index('by_status', ['status'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt']);
