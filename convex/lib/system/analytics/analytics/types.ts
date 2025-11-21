// convex/lib/system/analytics/analytics/types.ts
// Type definitions for analytics library functions

import { Doc, Id } from '@/generated/dataModel';

/**
 * Filter Types - Strict Type Safety
 */
export type FilterOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | string[] | number[];
}

export interface Filters {
  conditions: FilterCondition[];
  combinator: 'and' | 'or';
}

export interface MetricQuery {
  metricType: string;
  dimension?: string;
  filters?: Filters;
  dateRange?: {
    start: number;
    end: number;
  };
}

export interface MetricValue {
  count: number;
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  breakdown?: DimensionBreakdown;
}

/**
 * Dimension Breakdown - Type-safe metric breakdown by dimension
 */
export type DimensionBreakdown = Record<string, number>;

/**
 * Widget Configuration Types - Discriminated Unions
 */
export interface LineChartConfig {
  type: 'line_chart';
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  smooth?: boolean;
  stacked?: boolean;
}

export interface BarChartConfig {
  type: 'bar_chart';
  showLegend?: boolean;
  showGrid?: boolean;
  colors?: string[];
  horizontal?: boolean;
  stacked?: boolean;
}

export interface PieChartConfig {
  type: 'pie_chart';
  showLegend?: boolean;
  showValues?: boolean;
  colors?: string[];
  donut?: boolean;
}

export interface MetricConfig {
  type: 'metric';
  showTrend?: boolean;
  showComparison?: boolean;
  format?: 'number' | 'currency' | 'percentage';
  precision?: number;
}

export interface TableConfig {
  type: 'table';
  showPagination?: boolean;
  pageSize?: number;
  sortable?: boolean;
  columns?: {
    key: string;
    label: string;
    format?: 'number' | 'currency' | 'percentage' | 'date';
  }[];
}

export interface HeatmapConfig {
  type: 'heatmap';
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
  showValues?: boolean;
}

export type WidgetConfig =
  | LineChartConfig
  | BarChartConfig
  | PieChartConfig
  | MetricConfig
  | TableConfig
  | HeatmapConfig;

export interface DashboardWidget {
  id: string;
  type: 'line_chart' | 'bar_chart' | 'pie_chart' | 'metric' | 'table' | 'heatmap';
  title: string;
  query: MetricQuery;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  config?: WidgetConfig;
}

/**
 * Report Types
 */
export interface ReportSchedule {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  recipients: string[];
  lastRun?: number;
  nextRun?: number;
}

export interface ReportQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: Filters;
  dateRange: {
    start: number;
    end: number;
  };
}

/**
 * Provider Configuration Types
 */
export interface GoogleAnalyticsConfig {
  provider: 'google_analytics';
  measurementId: string;
  apiSecret: string;
  propertyId?: string;
}

export interface MixpanelConfig {
  provider: 'mixpanel';
  token: string;
  apiSecret?: string;
  projectId?: string;
}

export interface PlausibleConfig {
  provider: 'plausible';
  domain: string;
  apiKey?: string;
}

export interface InternalConfig {
  provider: 'internal';
  enableBatching?: boolean;
  batchSize?: number;
}

export type ProviderConfig =
  | GoogleAnalyticsConfig
  | MixpanelConfig
  | PlausibleConfig
  | InternalConfig;

/**
 * Transform Function Type - For event property transformations
 */
export interface PropertyTransform {
  sourceField: string;
  targetField: string;
  transformType: 'rename' | 'map' | 'compute' | 'filter';
  mapping?: Record<string, string | number | boolean>;
  computeExpression?: string;
}

export interface EventMapping {
  internalEvent: string;
  externalEvent: string;
  transform?: PropertyTransform[];
}

/**
 * Event Properties - Discriminated Unions by Event Type
 */
export interface PageViewProperties {
  eventType: 'page_view';
  duration?: number;
  scrollDepth?: number;
  exitPage?: boolean;
}

export interface UserActionProperties {
  eventType: 'user_action';
  action: string;
  category?: string;
  label?: string;
  target?: string;
  buttonText?: string;
  formId?: string;
}

export interface AIUsageProperties {
  eventType: 'ai_usage';
  modelId: string;
  modelName: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  cost: number;
  latency: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
}

export interface PaymentProperties {
  eventType: 'payment';
  transactionId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  subscriptionId?: string;
  planName?: string;
}

export interface ErrorProperties {
  eventType: 'error';
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  statusCode?: number;
  url?: string;
  componentName?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface CustomProperties {
  eventType: 'custom';
  category: string;
  data: Record<string, string | number | boolean>;
}

export type EventProperties =
  | PageViewProperties
  | UserActionProperties
  | AIUsageProperties
  | PaymentProperties
  | ErrorProperties
  | CustomProperties;

/**
 * Event Tracking Types
 */
export interface PageViewEvent {
  pageUrl: string;
  pagePath: string;
  pageTitle?: string;
  referrer?: string;
  userId?: Id<'userProfiles'>;
  sessionId: string;
  anonymousId?: string;
}

export interface UserActionEvent {
  eventName: string;
  properties?: EventProperties;
  value?: number;
  currency?: string;
  userId?: Id<'userProfiles'>;
  sessionId: string;
}

export interface DeviceInfo {
  userAgent?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  browser?: string;
  os?: string;
  screenResolution?: string;
}

export interface LocationInfo {
  ipAddress?: string;
  country?: string;
  city?: string;
  timezone?: string;
}

/**
 * Aggregation Types
 */
export interface AggregationOptions {
  metricType: string;
  period: 'hour' | 'day' | 'week' | 'month';
  startDate: number;
  endDate: number;
  dimension?: string;
  filters?: Filters;
}

export interface AggregatedMetric {
  metricType: string;
  period: 'hour' | 'day' | 'week' | 'month';
  periodStart: number;
  periodEnd: number;
  dimension?: string;
  values: MetricValue;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Analytics Summary Return Type
 * Used by getAnalyticsSummary query
 */
export interface AnalyticsSummary {
  dateRange: {
    start: number;
    end: number;
  };
  totalEvents: number;
  pageViews: number;
  uniqueUsers: number;
  activeSessions: number;
  eventsByType: Record<string, number>;
  avgSessionDuration?: number;
}

// ============================================================================
// Entity Types (from Doc<>)
// ============================================================================

export type AnalyticsEvent = Doc<'analyticsEvents'>;
export type AnalyticsEventId = Id<'analyticsEvents'>;

export type AnalyticsMetric = Doc<'analyticsMetrics'>;
export type AnalyticsMetricId = Id<'analyticsMetrics'>;

export type AnalyticsDashboard = Doc<'analyticsDashboards'>;
export type AnalyticsDashboardId = Id<'analyticsDashboards'>;

export type AnalyticsReport = Doc<'analyticsReports'>;
export type AnalyticsReportId = Id<'analyticsReports'>;

export type AnalyticsProviderSync = Doc<'analyticsProviderSync'>;
export type AnalyticsProviderSyncId = Id<'analyticsProviderSync'>;

// ============================================================================
// Create/Update Data Interfaces
// ============================================================================

/**
 * Dashboard Create/Update Interfaces
 */
export interface CreateDashboardData {
  name: string;
  slug: string;
  description?: string;
  type: 'overview' | 'ai_usage' | 'payments' | 'user_behavior' | 'performance' | 'custom';
  widgets: DashboardWidget[];
  isPublic: boolean;
}

export interface UpdateDashboardData {
  name?: string;
  description?: string;
  widgets?: DashboardWidget[];
  isPublic?: boolean;
}

/**
 * Report Create/Update Interfaces
 */
export interface CreateReportData {
  name: string;
  description?: string;
  reportType: 'usage_summary' | 'cost_analysis' | 'user_activity' | 'performance' | 'custom';
  query: ReportQuery;
  schedule?: ReportSchedule;
  exportFormats: ('csv' | 'json' | 'pdf')[];
  isPublic: boolean;
}

export interface UpdateReportData {
  name?: string;
  description?: string;
  query?: ReportQuery;
  schedule?: ReportSchedule;
  exportFormats?: ('csv' | 'json' | 'pdf')[];
  isPublic?: boolean;
}

/**
 * Event Create/Update Interfaces
 */
export interface CreateEventData {
  eventName: string;
  eventType: 'page_view' | 'user_action' | 'ai_usage' | 'payment' | 'error' | 'custom';
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

/**
 * Metric Create/Update Interfaces
 */
export interface CreateMetricData {
  name: string;
  metricType: string;
  dimension?: string;
  period: 'hour' | 'day' | 'week' | 'month';
  periodStart: number;
  periodEnd: number;
  count: number;
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  breakdown?: DimensionBreakdown;
}

export interface UpdateMetricData {
  name?: string;
  count?: number;
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  breakdown?: DimensionBreakdown;
}

/**
 * Provider Config Create/Update Interfaces
 */
export interface CreateProviderConfigData {
  name: string;
  provider: string;
  enabled: boolean;
  config: ProviderConfig;
  autoSync: boolean;
  syncDirection: 'export' | 'import' | 'bidirectional';
  eventMappings?: EventMapping[];
}

export interface UpdateProviderConfigData {
  name?: string;
  enabled?: boolean;
  config?: ProviderConfig;
  autoSync?: boolean;
  syncDirection?: 'export' | 'import' | 'bidirectional';
  eventMappings?: EventMapping[];
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Dashboard List Response
 */
export interface DashboardListResponse {
  dashboards: AnalyticsDashboard[];
  total: number;
  hasMore: boolean;
}

/**
 * Report List Response
 */
export interface ReportListResponse {
  reports: AnalyticsReport[];
  total: number;
  hasMore: boolean;
}

/**
 * Event List Response
 */
export interface EventListResponse {
  events: AnalyticsEvent[];
  total: number;
  hasMore: boolean;
}

/**
 * Metric List Response
 */
export interface MetricListResponse {
  metrics: AnalyticsMetric[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Filter Types for List Queries
// ============================================================================

/**
 * Dashboard Filters
 */
export interface DashboardFilters {
  type?: ('overview' | 'ai_usage' | 'payments' | 'user_behavior' | 'performance' | 'custom')[];
  status?: ('active' | 'archived')[];
  isPublic?: boolean;
  search?: string;
}

/**
 * Report Filters
 */
export interface ReportFilters {
  reportType?: ('usage_summary' | 'cost_analysis' | 'user_activity' | 'performance' | 'custom')[];
  status?: ('active' | 'archived' | 'scheduled')[];
  isPublic?: boolean;
  search?: string;
}

/**
 * Event Filters
 */
export interface EventFilters {
  eventType?: ('page_view' | 'user_action' | 'ai_usage' | 'payment' | 'error' | 'custom')[];
  status?: ('pending' | 'processed' | 'synced' | 'failed')[];
  startDate?: number;
  endDate?: number;
  search?: string;
}

/**
 * Metric Filters
 */
export interface MetricFilters {
  metricType?: string[];
  period?: ('hour' | 'day' | 'week' | 'month')[];
  status?: ('active' | 'archived')[];
  startDate?: number;
  endDate?: number;
}
