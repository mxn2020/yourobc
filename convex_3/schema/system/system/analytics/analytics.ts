// convex/schema/system/core/analytics/analytics.ts
// Table definitions for analytics module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { analyticsFields, analyticsValidators } from './validators';

/**
 * Analytics Events Table
 * Stores all tracked events (page views, user actions, AI usage, payments, etc.)
 */
export const analyticsEventsTable = defineTable({
  // Required: Core fields
  name: v.string(),
  publicId: v.string(),
  actorId: v.optional(v.id('userProfiles')), // Actor initiating or owning the event (optional for anonymous events)

  // Event Identity
  eventName: v.string(), // 'page_view', 'button_click', 'ai_request', etc.
  eventType: analyticsValidators.eventType,

  // User Context
  userId: v.optional(v.id('userProfiles')), // The user who performed the tracked action (actor)
  sessionId: v.string(),
  anonymousId: v.optional(v.string()), // For non-logged-in users

  // Event Data - Discriminated union by eventType
  properties: v.optional(analyticsFields.eventProperties),
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
  .index('by_name', ['name'])
  .index('by_actor_id', ['actorId'])
  .index('by_event_name', ['eventName'])
  .index('by_event_type', ['eventType'])
  .index('by_user_id', ['userId'])
  .index('by_session', ['sessionId'])
  .index('by_timestamp', ['timestamp'])
  .index('by_actor_and_timestamp', ['actorId', 'timestamp'])
  .index('by_user_timestamp', ['userId', 'timestamp'])
  .index('by_sync_status', ['syncStatus'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);

/**
 * Analytics Metrics Table
 * Stores pre-aggregated metrics for faster querying
 */
export const analyticsMetricsTable = defineTable({
  // Required: Core fields
  name: v.string(),
  publicId: v.string(),
  actorId: v.optional(v.id('userProfiles')), // Actor owning the metric aggregation

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
  .index('by_name', ['name'])
  .index('by_actor_id', ['actorId'])
  .index('by_metric_period', ['metricType', 'period', 'periodStart'])
  .index('by_metric_actor', ['metricType', 'actorId'])
  .index('by_period_start', ['periodStart'])
  .index('by_metric_dimension', ['metricType', 'dimension'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);

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
  actorId: v.id('userProfiles'), // User who owns this dashboard
  actorName: v.string(),

  // Dashboard information
  description: v.optional(v.string()),

  // Dashboard Type
  type: analyticsValidators.dashboardType,

  // Dashboard Config
  widgets: v.array(analyticsFields.dashboardWidget),

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
  .index('by_actor_id', ['actorId'])
  .index('by_actor_and_type', ['actorId', 'type'])
  .index('by_public', ['isPublic'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);

/**
 * Analytics Reports Table
 * Scheduled and saved reports
 */
export const analyticsReportsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  actorId: v.id('userProfiles'), // User who owns this report
  status: v.union(v.literal('active'), v.literal('archived'), v.literal('scheduled')),

  // Report information
  description: v.optional(v.string()),

  // Report Configuration
  reportType: analyticsValidators.reportType,
  query: analyticsFields.reportQuery,

  // Scheduling
  schedule: v.optional(analyticsFields.reportSchedule),

  // Results - data is array of metric rows
  lastResult: v.optional(analyticsFields.reportResult),

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
  .index('by_actor_id', ['actorId'])
  .index('by_type', ['reportType'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);

/**
 * Analytics Provider Sync Table
 * Configuration for external analytics providers
 */
export const analyticsProviderSyncTable = defineTable({
  // Required: Main display field
  provider: v.string(), // 'google_analytics', 'mixpanel', 'plausible'

  // Required: Core fields
  publicId: v.string(),
  actorId: v.id('userProfiles'), // User who configured this provider sync
  actorName: v.string(),
  status: v.union(v.literal('active'), v.literal('inactive'), v.literal('error')),

  // Configuration - Discriminated union by provider
  enabled: v.boolean(),
  config: analyticsFields.providerConfig,

  // Sync Settings
  autoSync: v.boolean(),
  syncDirection: analyticsValidators.syncDirection,

  // Event Mapping
  eventMappings: v.optional(analyticsFields.eventMappings),

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
  .index('by_actor_id', ['actorId'])
  .index('by_provider', ['provider'])
  .index('by_actor_and_provider', ['actorId', 'provider'])
  .index('by_enabled', ['enabled'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);
