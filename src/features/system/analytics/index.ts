// src/features/system/analytics/index.ts
// Main export file for the Analytics feature

// Types (export types explicitly to avoid conflicts with component names)
export type {
  AnalyticsProvider as IAnalyticsProvider,
  AnalyticsEventType,
  DeviceType,
  MetricPeriod,
  DashboardType,
  WidgetType,
  ReportType,
  ReportFrequency,
  ExportFormat,
  AnalyticsProviderType,
  SyncDirection,
  TrackEventParams,
  PageViewParams,
  UserTraits,
  GetMetricParams,
  MetricData,
  Dashboard,
  DashboardWidget,
  MetricQuery,
  WidgetPosition,
  DashboardFilters,
  CreateDashboardData,
  UpdateDashboardData,
  Report,
  ReportQuery,
  ReportSchedule,
  ReportLastResult,
  ReportFilters,
  ReportResult,
  DateRange,
  DateRangePreset,
  ChartDataPoint,
  ChartSeries,
  AnalyticsContextValue,
} from "./types";

// Configuration
export * from "./config/analytics-config";

// Services
export { analyticsService, AnalyticsService } from "./services/AnalyticsService";

// Hooks (AnalyticsProvider component is exported here)
export * from "./hooks";

// Components
export * from "./components";

// Pages
export * from "./pages";

// Utilities
export * from "./utils";
