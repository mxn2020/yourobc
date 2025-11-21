// convex/schema/system/analytics/analytics/validators.ts
// Grouped validators for analytics module

import { v } from 'convex/values';

export const analyticsValidators = {
  // Event types
  eventType: v.union(
    v.literal('page_view'),
    v.literal('user_action'),
    v.literal('ai_usage'),
    v.literal('payment'),
    v.literal('error'),
    v.literal('custom')
  ),

  // Device types
  deviceType: v.union(
    v.literal('desktop'),
    v.literal('mobile'),
    v.literal('tablet')
  ),

  // Sync status
  syncStatus: v.union(
    v.literal('pending'),
    v.literal('synced'),
    v.literal('failed')
  ),

  // Metric periods
  metricPeriod: v.union(
    v.literal('hour'),
    v.literal('day'),
    v.literal('week'),
    v.literal('month')
  ),

  // Dashboard types
  dashboardType: v.union(
    v.literal('overview'),
    v.literal('ai_usage'),
    v.literal('payments'),
    v.literal('user_behavior'),
    v.literal('performance'),
    v.literal('custom')
  ),

  // Widget types
  widgetType: v.union(
    v.literal('line_chart'),
    v.literal('bar_chart'),
    v.literal('pie_chart'),
    v.literal('metric'),
    v.literal('table'),
    v.literal('heatmap')
  ),

  // Report types
  reportType: v.union(
    v.literal('usage_summary'),
    v.literal('cost_analysis'),
    v.literal('user_activity'),
    v.literal('performance'),
    v.literal('custom')
  ),

  // Report frequency
  reportFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly')
  ),

  // Export formats
  exportFormat: v.union(
    v.literal('csv'),
    v.literal('json'),
    v.literal('pdf')
  ),

  // Analytics providers
  analyticsProvider: v.union(
    v.literal('internal'),
    v.literal('google_analytics'),
    v.literal('mixpanel'),
    v.literal('plausible')
  ),

  // Sync direction
  syncDirection: v.union(
    v.literal('export'),
    v.literal('import'),
    v.literal('bidirectional')
  ),

  // Payment status
  paymentStatus: v.union(
    v.literal('pending'),
    v.literal('completed'),
    v.literal('failed'),
    v.literal('refunded')
  ),

  // Error severity
  errorSeverity: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('critical')
  ),

  // Filter operators
  filterOperator: v.union(
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

  // Transform types
  transformType: v.union(
    v.literal('rename'),
    v.literal('map'),
    v.literal('compute'),
    v.literal('filter')
  ),

  // Chart format types
  chartFormat: v.union(
    v.literal('number'),
    v.literal('currency'),
    v.literal('percentage'),
    v.literal('date')
  ),

  // Color schemes
  colorScheme: v.union(
    v.literal('blue'),
    v.literal('green'),
    v.literal('red'),
    v.literal('purple')
  ),

  // Last sync status for providers
  lastSyncStatus: v.union(
    v.literal('success'),
    v.literal('partial'),
    v.literal('error')
  ),
} as const;
