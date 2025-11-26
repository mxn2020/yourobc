// src/features/system/analytics/providers/internal/InternalAnalyticsProvider.ts

import { useMutation, useQuery } from "convex/react";
import { api } from '@/generated/api';
import { Id } from "@/convex/_generated/dataModel";
import {
  AnalyticsProvider,
  TrackEventParams,
  PageViewParams,
  UserTraits,
  GetMetricParams,
  MetricData,
  Dashboard,
  DashboardFilters,
  CreateDashboardData,
  UpdateDashboardData,
  Report,
  ReportFilters,
  ReportResult,
  ExportFormat,
} from "../../types";

/**
 * Internal Analytics Provider
 * Uses Convex backend for analytics tracking and querying
 */
export class InternalAnalyticsProvider implements AnalyticsProvider {
  type = "internal" as const;
  private sessionId: string;
  private anonymousId?: string;

  constructor() {
    // Initialize session
    this.sessionId = this.getOrCreateSessionId();
    this.anonymousId = this.getOrCreateAnonymousId();
  }

  /**
   * Track a custom event
   */
  async trackEvent(params: TrackEventParams): Promise<void> {
    const mutation = useMutation(api.lib.system.core.analytics.mutations.trackEvent);

    await mutation({
      eventName: params.eventName,
      eventType: params.eventType,
      sessionId: this.sessionId,
      anonymousId: this.anonymousId,
      properties: params.properties,
      value: params.value,
      currency: params.currency,
      pageUrl: window.location.href,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      referrer: document.referrer || undefined,
      userAgent: navigator.userAgent,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
  }

  /**
   * Track a page view
   */
  async trackPageView(params: PageViewParams): Promise<void> {
    const mutation = useMutation(api.lib.system.core.analytics.mutations.trackPageView);

    await mutation({
      pageUrl: window.location.href,
      pagePath: params.path,
      pageTitle: params.title || document.title,
      referrer: params.referrer || document.referrer || undefined,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
    });
  }

  /**
   * Identify a user (not needed for internal, but part of interface)
   */
  async identifyUser(
    userId: Id<"userProfiles">,
    traits?: UserTraits
  ): Promise<void> {
    // Store user ID for future events
    this.storeUserId(userId);
  }

  /**
   * Get metric data
   */
  async getMetric(params: GetMetricParams): Promise<MetricData[]> {
    const query = useQuery(api.lib.system.core.analytics.queries.getMetric, {
      metricType: params.metricType,
      period: params.period,
      startDate: params.startDate,
      endDate: params.endDate,
      dimension: params.dimension,
    });

    if (!query) return [];

    return query.map((m) => ({
      periodStart: m.periodStart,
      periodEnd: m.periodEnd,
      count: m.count,
      sum: m.sum,
      average: m.average,
      min: m.min,
      max: m.max,
      breakdown: m.breakdown,
    }));
  }

  /**
   * Get multiple metrics
   */
  async getMetrics(
    metricTypes: string[],
    params: GetMetricParams
  ): Promise<Record<string, MetricData[]>> {
    const results: Record<string, MetricData[]> = {};

    for (const metricType of metricTypes) {
      results[metricType] = await this.getMetric({
        ...params,
        metricType,
      });
    }

    return results;
  }

  /**
   * Get dashboards
   */
  async getDashboards(filters?: DashboardFilters): Promise<Dashboard[]> {
    const query = useQuery(api.lib.system.core.analytics.queries.getDashboards, {
      type: filters?.type,
      includePublic: filters?.includePublic,
    });

    return (query?.dashboards || []) as Dashboard[];
  }

  /**
   * Get a single dashboard
   */
  async getDashboard(
    dashboardId: Id<"analyticsDashboards">
  ): Promise<Dashboard | null> {
    const query = useQuery(
      api.lib.system.core.analytics.queries.getDashboard,
      { dashboardId }
    );

    return (query || null) as Dashboard | null;
  }

  /**
   * Create a dashboard
   */
  async createDashboard(
    data: CreateDashboardData
  ): Promise<Id<"analyticsDashboards">> {
    const mutation = useMutation(
      api.lib.system.core.analytics.mutations.createDashboard
    );

    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error("User must be logged in to create dashboard");
    }

    return await mutation(data);
  }

  /**
   * Update a dashboard
   */
  async updateDashboard(
    dashboardId: Id<"analyticsDashboards">,
    data: UpdateDashboardData
  ): Promise<void> {
    const mutation = useMutation(
      api.lib.system.core.analytics.mutations.updateDashboard
    );

    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error("User must be logged in to update dashboard");
    }

    await mutation({
      dashboardId,
      updates: data,
    });
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(dashboardId: Id<"analyticsDashboards">): Promise<void> {
    const mutation = useMutation(
      api.lib.system.core.analytics.mutations.deleteDashboard
    );

    const userId = this.getCurrentUserId();
    if (!userId) {
      throw new Error("User must be logged in to delete dashboard");
    }

    await mutation({ dashboardId });
  }

  /**
   * Get reports
   */
  async getReports(filters?: ReportFilters): Promise<Report[]> {
    const query = useQuery(api.lib.system.core.analytics.queries.getReports, {
      reportType: filters?.reportType,
      includePublic: filters?.includePublic,
    });

    return (query?.reports || []) as Report[];
  }

  /**
   * Generate a report
   */
  async generateReport(
    reportId: Id<"analyticsReports">
  ): Promise<ReportResult> {
    // Get the report configuration
    const reportQuery = useQuery(api.lib.system.core.analytics.queries.getReport, {
      reportId,
    });

    if (!reportQuery) {
      throw new Error("Report not found");
    }

    // Fetch data for each metric in the report
    const data: Array<{ metric: string; data: MetricData[] }> = [];
    for (const metricType of reportQuery.query.metrics) {
      const metricData = await this.getMetric({
        metricType,
        period: "day",
        startDate: reportQuery.query.dateRange.start,
        endDate: reportQuery.query.dateRange.end,
      });
      data.push({ metric: metricType, data: metricData });
    }

    return {
      data,
      metadata: {
        generatedAt: Date.now(),
        rowCount: data.length,
        query: reportQuery.query,
      },
    };
  }

  /**
   * Export a report
   */
  async exportReport(
    reportId: Id<"analyticsReports">,
    format: ExportFormat
  ): Promise<Blob> {
    const reportData = await this.generateReport(reportId);

    switch (format) {
      case "json":
        return new Blob([JSON.stringify(reportData, null, 2)], {
          type: "application/json",
        });

      case "csv": {
        // Convert to CSV
        const csv = this.convertToCSV(reportData.data);
        return new Blob([csv], { type: "text/csv" });
      }

      case "pdf":
        throw new Error("PDF export not yet implemented");

      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  /**
   * Helper: Get or create session ID
   */
  private getOrCreateSessionId(): string {
    const storageKey = "analytics_session_id";
    const sessionTimeout = 30 * 60 * 1000; // 30 minutes

    const stored = sessionStorage.getItem(storageKey);
    const lastActivity = sessionStorage.getItem("analytics_last_activity");

    if (
      stored &&
      lastActivity &&
      Date.now() - parseInt(lastActivity) < sessionTimeout
    ) {
      // Update last activity
      sessionStorage.setItem(
        "analytics_last_activity",
        Date.now().toString()
      );
      return stored;
    }

    // Create new session
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem(storageKey, newSessionId);
    sessionStorage.setItem("analytics_last_activity", Date.now().toString());

    return newSessionId;
  }

  /**
   * Helper: Get or create anonymous ID
   */
  private getOrCreateAnonymousId(): string {
    const storageKey = "analytics_anonymous_id";
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      return stored;
    }

    const newAnonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem(storageKey, newAnonymousId);

    return newAnonymousId;
  }

  /**
   * Helper: Store user ID
   */
  private storeUserId(userId: Id<"userProfiles">): void {
    localStorage.setItem("analytics_user_id", userId);
  }

  /**
   * Helper: Get current user ID
   */
  private getCurrentUserId(): Id<"userProfiles"> | null {
    const stored = localStorage.getItem("analytics_user_id");
    return (stored as Id<"userProfiles">) ?? null;
  }

  /**
   * Helper: Convert data to CSV
   */
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    // Extract headers
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  }
}

/**
 * Create and export a singleton instance
 */
export const internalAnalyticsProvider = new InternalAnalyticsProvider();
