// convex/lib/system/core/analytics/types.ts
// TypeScript type definitions for analytics module business logic

import type { Id } from '@/generated/dataModel';
import type {
  AnalyticsDashboardWidget,
  AnalyticsReportQuery,
  AnalyticsReportSchedule,
  AnalyticsReportResult,
  AnalyticsProviderConfig,
  AnalyticsEventProperties,
  AnalyticsFilterGroup,
  AnalyticsEventMappings,
  AnalyticsProviderType,
  FilterOperator,
  DeviceType,
  SyncStatus,
  MetricPeriod,
  DashboardType,
  WidgetType,
  ReportType,
  ReportFrequency,
  ExportFormat,
  SyncDirection,
  PaymentStatus,
  ErrorSeverity,
  TransformType,
  ChartFormat,
  ColorScheme,
  LastSyncStatus,
} from '@/schema/system/core/analytics/types';

export type {
  AnalyticsDashboardWidget,
  AnalyticsReportQuery,
  AnalyticsReportSchedule,
  AnalyticsReportResult,
  AnalyticsProviderConfig,
  AnalyticsEventProperties,
  AnalyticsFilterGroup,
  AnalyticsEventMappings,
  AnalyticsProviderType,
  FilterOperator,
  DeviceType,
  SyncStatus,
  MetricPeriod,
  DashboardType,
  WidgetType,
  ReportType,
  ReportFrequency,
  ExportFormat,
  SyncDirection,
  PaymentStatus,
  ErrorSeverity,
  TransformType,
  ChartFormat,
  ColorScheme,
  LastSyncStatus,
};

export type Filters = AnalyticsFilterGroup;
export type EventProperties = AnalyticsEventProperties;
export type WidgetConfig = AnalyticsDashboardWidget['config'];
export type DashboardWidget = AnalyticsDashboardWidget;
export type ReportQuery = AnalyticsReportQuery;
export type ReportSchedule = AnalyticsReportSchedule;
export type ReportResult = AnalyticsReportResult;
export type ProviderConfig = AnalyticsProviderConfig;
export type EventMapping = AnalyticsEventMappings[number];
export type PropertyTransform = NonNullable<AnalyticsEventMappings[number]['transform']>[number];

export type DimensionBreakdown = Record<string, number>;

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

export interface ReportScheduleWithMetadata extends ReportSchedule {
  enabled: boolean;
  lastRun?: number;
  nextRun?: number;
}

export interface ReportQueryWithMetadata extends ReportQuery {
  dateRange: {
    start: number;
    end: number;
  };
}

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
  deviceType?: DeviceType;
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

export interface AggregationOptions {
  metricType: string;
  period: MetricPeriod;
  startDate: number;
  endDate: number;
  dimension?: string;
  filters?: Filters;
}

export interface AggregatedMetric {
  metricType: string;
  period: MetricPeriod;
  periodStart: number;
  periodEnd: number;
  dimension?: string;
  values: MetricValue;
  metadata?: Record<string, string | number | boolean>;
}

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
