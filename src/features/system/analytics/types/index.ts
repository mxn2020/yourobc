// src/features/boilerplate/analytics/types/index.ts

import { Id } from "@/convex/_generated/dataModel";
import type {
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
  EventProperties,
  WidgetConfig,
  Filters,
} from "../../../../../convex/lib/system/analytics/types";

/**
 * Re-export backend types that are used in frontend
 */
export type {
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
  EventProperties,
  WidgetConfig,
  Filters,
};

/**
 * Provider Interface
 */
export interface AnalyticsProvider {
  type: AnalyticsProviderType;

  // Event Tracking
  trackEvent(event: TrackEventParams): Promise<void>;
  trackPageView(page: PageViewParams): Promise<void>;
  identifyUser(userId: Id<"userProfiles">, traits?: UserTraits): Promise<void>;

  // Metrics
  getMetric(params: GetMetricParams): Promise<MetricData[]>;
  getMetrics(metricTypes: string[], params: GetMetricParams): Promise<Record<string, MetricData[]>>;

  // Dashboards
  getDashboards(filters?: DashboardFilters): Promise<Dashboard[]>;
  getDashboard(dashboardId: Id<"analyticsDashboards">): Promise<Dashboard | null>;
  createDashboard(data: CreateDashboardData): Promise<Id<"analyticsDashboards">>;
  updateDashboard(dashboardId: Id<"analyticsDashboards">, data: UpdateDashboardData): Promise<void>;
  deleteDashboard(dashboardId: Id<"analyticsDashboards">): Promise<void>;

  // Reports
  getReports(filters?: ReportFilters): Promise<Report[]>;
  generateReport(reportId: Id<"analyticsReports">): Promise<ReportResult>;
  exportReport(reportId: Id<"analyticsReports">, format: ExportFormat): Promise<Blob>;
}

/**
 * Event Tracking
 */
export interface TrackEventParams {
  eventName: string;
  eventType: AnalyticsEventType;
  properties?: EventProperties;
  value?: number;
  currency?: string;
  userId?: Id<"userProfiles">;
}

export interface PageViewParams {
  path: string;
  title?: string;
  referrer?: string;
  userId?: Id<"userProfiles">;
}

export interface UserTraits {
  name?: string;
  email?: string;
  plan?: string;
  role?: string;
  [key: string]: any;
}

/**
 * Metrics
 */
export interface GetMetricParams {
  metricType: string;
  period: MetricPeriod;
  startDate: number;
  endDate: number;
  dimension?: string;
}

export interface MetricData {
  periodStart: number;
  periodEnd: number;
  count: number;
  sum?: number;
  average?: number;
  min?: number;
  max?: number;
  breakdown?: Record<string, number>;
}

/**
 * Dashboards
 */
export interface Dashboard {
  _id: Id<"analyticsDashboards">;
  name: string;
  slug: string;
  description?: string;
  type: DashboardType;
  widgets: DashboardWidget[];
  isPublic: boolean;
  ownerId: Id<"userProfiles">;
  ownerName: string;
  createdAt: number;
  updatedAt: number;
}

export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  query: MetricQuery;
  position: WidgetPosition;
  config?: WidgetConfig;
}

export interface MetricQuery {
  metricType: string;
  dimension?: string;
  filters?: Filters;
  dateRange?: DateRange;
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DashboardFilters {
  userId?: Id<"userProfiles">;
  type?: DashboardType;
  includePublic?: boolean;
}

export interface CreateDashboardData {
  name: string;
  slug: string;
  description?: string;
  type: DashboardType;
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
 * Reports
 */
export interface Report {
  _id: Id<"analyticsReports">;
  name: string;
  description?: string;
  reportType: ReportType;
  query: ReportQuery;
  schedule?: ReportSchedule;
  exportFormats: ExportFormat[];
  ownerId: Id<"userProfiles">;
  isPublic: boolean;
  lastResult?: ReportLastResult;
  createdAt: number;
  updatedAt: number;
}

export interface ReportQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: Filters;
  dateRange: DateRange;
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: ReportFrequency;
  time: string;
  recipients: string[];
  lastRun?: number;
  nextRun?: number;
}

export interface ReportLastResult {
  data: any;
  generatedAt: number;
  rowCount: number;
}

export interface ReportFilters {
  userId?: Id<"userProfiles">;
  reportType?: ReportType;
  includePublic?: boolean;
}

export interface ReportResult {
  data: any[];
  metadata: {
    generatedAt: number;
    rowCount: number;
    query: ReportQuery;
  };
}

/**
 * Common Types
 */
export interface DateRange {
  start: number;
  end: number;
}

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "this_month"
  | "last_month"
  | "this_year"
  | "custom";

/**
 * Analytics Summary (from backend)
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

/**
 * Chart Data Types
 */
export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
}

/**
 * Analytics Context
 */
export interface AnalyticsContextValue {
  provider: AnalyticsProvider;
  isInitialized: boolean;
  trackEvent: (params: TrackEventParams) => Promise<void>;
  trackPageView: (params: PageViewParams) => Promise<void>;
  identifyUser: (userId: Id<"userProfiles">, traits?: UserTraits) => Promise<void>;
}
