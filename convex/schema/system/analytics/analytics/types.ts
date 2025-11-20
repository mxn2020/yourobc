// convex/schema/boilerplate/analytics/analytics/types.ts
// Type extractions from validators for analytics module

import { Infer } from 'convex/values';
import { analyticsValidators } from './validators';

// Extract types from validators
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
