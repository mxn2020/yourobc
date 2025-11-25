// convex/schema/system/core/analytics/types.ts
// Type extractions from validators for analytics module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { analyticsFields, analyticsValidators } from './validators';
import {
  analyticsEventsTable,
  analyticsMetricsTable,
  analyticsDashboardsTable,
  analyticsReportsTable,
  analyticsProviderSyncTable,
} from './tables';

// ============================================
// Document Types
// ============================================

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

// ============================================
// Schema Types (from table validators)
// ============================================

export type AnalyticsEventSchema = Infer<typeof analyticsEventsTable.validator>;
export type AnalyticsMetricSchema = Infer<typeof analyticsMetricsTable.validator>;
export type AnalyticsDashboardSchema = Infer<typeof analyticsDashboardsTable.validator>;
export type AnalyticsReportSchema = Infer<typeof analyticsReportsTable.validator>;
export type AnalyticsProviderSyncSchema = Infer<typeof analyticsProviderSyncTable.validator>;

// ============================================
// Validator Types (Simple Unions)
// ============================================

export type AnalyticsEventType = Infer<typeof analyticsValidators.eventType>;
export type DeviceType = Infer<typeof analyticsValidators.deviceType>;
export type SyncStatus = Infer<typeof analyticsValidators.syncStatus>;
export type MetricPeriod = Infer<typeof analyticsValidators.metricPeriod>;
export type DashboardType = Infer<typeof analyticsValidators.dashboardType>;
export type WidgetType = Infer<typeof analyticsValidators.widgetType>;
export type ReportType = Infer<typeof analyticsValidators.reportType>;
export type ReportFrequency = Infer<typeof analyticsValidators.reportFrequency>;
export type ExportFormat = Infer<typeof analyticsValidators.exportFormat>;
export type AnalyticsProviderType = Infer<typeof analyticsValidators.analyticsProvider>;
export type SyncDirection = Infer<typeof analyticsValidators.syncDirection>;
export type PaymentStatus = Infer<typeof analyticsValidators.paymentStatus>;
export type ErrorSeverity = Infer<typeof analyticsValidators.errorSeverity>;
export type FilterOperator = Infer<typeof analyticsValidators.filterOperator>;
export type TransformType = Infer<typeof analyticsValidators.transformType>;
export type ChartFormat = Infer<typeof analyticsValidators.chartFormat>;
export type ColorScheme = Infer<typeof analyticsValidators.colorScheme>;
export type LastSyncStatus = Infer<typeof analyticsValidators.lastSyncStatus>;

// ============================================
// Field Types (Complex Objects)
// ============================================

export type AnalyticsEventProperties = Infer<typeof analyticsFields.eventProperties>;
export type AnalyticsFilterGroup = Infer<typeof analyticsFields.filterGroup>;
export type AnalyticsDashboardWidget = Infer<typeof analyticsFields.dashboardWidget>;
export type AnalyticsReportQuery = Infer<typeof analyticsFields.reportQuery>;
export type AnalyticsReportSchedule = Infer<typeof analyticsFields.reportSchedule>;
export type AnalyticsReportResult = Infer<typeof analyticsFields.reportResult>;
export type AnalyticsProviderConfig = Infer<typeof analyticsFields.providerConfig>;
export type AnalyticsEventMappings = Infer<typeof analyticsFields.eventMappings>;
