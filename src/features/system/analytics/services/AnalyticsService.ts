// src/features/boilerplate/analytics/services/AnalyticsService.ts

import { AnalyticsProvider, AnalyticsProviderType } from "../types";
import { getAnalyticsProvider, shouldTrackEvent } from "../config/analytics-config";
import { internalAnalyticsProvider } from "../providers/internal/InternalAnalyticsProvider";
import type {
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
} from "../types";
import { Id } from "@/convex/_generated/dataModel";

/**
 * Analytics Service
 * Facade pattern to provide a unified interface for analytics operations
 * Supports multiple providers (internal, Google Analytics, Mixpanel, Plausible)
 */
class AnalyticsService {
  private provider: AnalyticsProvider;
  private isInitialized = false;

  constructor() {
    // Initialize with internal provider by default
    this.provider = internalAnalyticsProvider;
  }

  /**
   * Initialize the analytics service
   */
  async initialize(providerType?: AnalyticsProviderType): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const provider = providerType || getAnalyticsProvider();

    switch (provider) {
      case "internal":
        this.provider = internalAnalyticsProvider;
        break;

      case "google_analytics":
        // TODO: Implement Google Analytics provider
        console.warn("Google Analytics provider not yet implemented, using internal");
        this.provider = internalAnalyticsProvider;
        break;

      case "mixpanel":
        // TODO: Implement Mixpanel provider
        console.warn("Mixpanel provider not yet implemented, using internal");
        this.provider = internalAnalyticsProvider;
        break;

      case "plausible":
        // TODO: Implement Plausible provider
        console.warn("Plausible provider not yet implemented, using internal");
        this.provider = internalAnalyticsProvider;
        break;

      default:
        console.warn(`Unknown analytics provider: ${provider}, using internal`);
        this.provider = internalAnalyticsProvider;
    }

    this.isInitialized = true;
  }

  /**
   * Get the current provider
   */
  getProvider(): AnalyticsProvider {
    return this.provider;
  }

  /**
   * Check if service is initialized
   */
  getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Track a custom event
   */
  async trackEvent(params: TrackEventParams): Promise<void> {
    if (!shouldTrackEvent()) return;

    try {
      await this.provider.trackEvent(params);
    } catch (error) {
      console.error("Failed to track event:", error);
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(params: PageViewParams): Promise<void> {
    if (!shouldTrackEvent()) return;

    try {
      await this.provider.trackPageView(params);
    } catch (error) {
      console.error("Failed to track page view:", error);
    }
  }

  /**
   * Identify a user
   */
  async identifyUser(
    userId: Id<"userProfiles">,
    traits?: UserTraits
  ): Promise<void> {
    try {
      await this.provider.identifyUser(userId, traits);
    } catch (error) {
      console.error("Failed to identify user:", error);
    }
  }

  /**
   * Get metric data
   */
  async getMetric(params: GetMetricParams): Promise<MetricData[]> {
    try {
      return await this.provider.getMetric(params);
    } catch (error) {
      console.error("Failed to get metric:", error);
      return [];
    }
  }

  /**
   * Get multiple metrics
   */
  async getMetrics(
    metricTypes: string[],
    params: GetMetricParams
  ): Promise<Record<string, MetricData[]>> {
    try {
      return await this.provider.getMetrics(metricTypes, params);
    } catch (error) {
      console.error("Failed to get metrics:", error);
      return {};
    }
  }

  /**
   * Get dashboards
   */
  async getDashboards(filters?: DashboardFilters): Promise<Dashboard[]> {
    try {
      return await this.provider.getDashboards(filters);
    } catch (error) {
      console.error("Failed to get dashboards:", error);
      return [];
    }
  }

  /**
   * Get a single dashboard
   */
  async getDashboard(
    dashboardId: Id<"analyticsDashboards">
  ): Promise<Dashboard | null> {
    try {
      return await this.provider.getDashboard(dashboardId);
    } catch (error) {
      console.error("Failed to get dashboard:", error);
      return null;
    }
  }

  /**
   * Create a dashboard
   */
  async createDashboard(
    data: CreateDashboardData
  ): Promise<Id<"analyticsDashboards">> {
    try {
      return await this.provider.createDashboard(data);
    } catch (error) {
      console.error("Failed to create dashboard:", error);
      throw error;
    }
  }

  /**
   * Update a dashboard
   */
  async updateDashboard(
    dashboardId: Id<"analyticsDashboards">,
    data: UpdateDashboardData
  ): Promise<void> {
    try {
      await this.provider.updateDashboard(dashboardId, data);
    } catch (error) {
      console.error("Failed to update dashboard:", error);
      throw error;
    }
  }

  /**
   * Delete a dashboard
   */
  async deleteDashboard(dashboardId: Id<"analyticsDashboards">): Promise<void> {
    try {
      await this.provider.deleteDashboard(dashboardId);
    } catch (error) {
      console.error("Failed to delete dashboard:", error);
      throw error;
    }
  }

  /**
   * Get reports
   */
  async getReports(filters?: ReportFilters): Promise<Report[]> {
    try {
      return await this.provider.getReports(filters);
    } catch (error) {
      console.error("Failed to get reports:", error);
      return [];
    }
  }

  /**
   * Generate a report
   */
  async generateReport(
    reportId: Id<"analyticsReports">
  ): Promise<ReportResult> {
    try {
      return await this.provider.generateReport(reportId);
    } catch (error) {
      console.error("Failed to generate report:", error);
      throw error;
    }
  }

  /**
   * Export a report
   */
  async exportReport(
    reportId: Id<"analyticsReports">,
    format: ExportFormat
  ): Promise<Blob> {
    try {
      return await this.provider.exportReport(reportId, format);
    } catch (error) {
      console.error("Failed to export report:", error);
      throw error;
    }
  }

  /**
   * Track button click (convenience method)
   */
  async trackButtonClick(buttonName: string, properties?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      eventName: "button_clicked",
      eventType: "user_action",
      properties: {
        eventType: "user_action",
        action: "click",
        buttonName,
        ...properties,
      },
    });
  }

  /**
   * Track form submission (convenience method)
   */
  async trackFormSubmit(formName: string, properties?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      eventName: "form_submitted",
      eventType: "user_action",
      properties: {
        eventType: "user_action",
        action: "submit",
        formName: formName,
        ...properties,
      },
    });
  }

  /**
   * Track error (convenience method)
   */
  async trackError(errorMessage: string, properties?: Record<string, any>): Promise<void> {
    return this.trackEvent({
      eventName: "error",
      eventType: "error",
      properties: {
        eventType: "error",
        errorType: properties?.errorType || "general",
        errorMessage: errorMessage,
        severity: properties?.severity || "medium",
        ...properties,
      },
    });
  }

  /**
   * Track AI usage (convenience method)
   */
  async trackAIUsage(
    errorCode?: string,
    errorMessage?: string,
    properties?: Record<string, any>
  ): Promise<void> {
    return this.trackEvent({
      eventName: "ai_request",
      eventType: "ai_usage",
      value: properties?.cost,
      currency: "USD",
      properties: {
        eventType: "ai_usage",
        modelId: properties?.modelId,
        modelName: properties?.modelName,
        provider: properties?.provider,
        promptTokens: properties?.promptTokens,
        completionTokens: properties?.completionTokens,
        totalTokens: properties?.totalTokens,
        cost: properties?.cost,
        latency: properties?.latency,
        success: !errorCode,
        errorCode,
        errorMessage,
        ...properties,
      },
    });
  }

  /**
   * Track payment (convenience method)
   */
  async trackPayment(
    amount: number,
    currency: string,
    transactionId: string,
    paymentMethod: string,
    status: 'pending' | 'completed' | 'failed' | 'refunded',
    properties?: Record<string, any>
  ): Promise<void> {
    return this.trackEvent({
      eventName: "payment_success",
      eventType: "payment",
      value: amount,
      currency,
      properties: {
        eventType: "payment",
        transactionId,
        amount,
        currency,
        paymentMethod,
        status,
        ...properties,
      },
    });
  }
}

/**
 * Export singleton instance
 */
export const analyticsService = new AnalyticsService();

/**
 * Export class for testing
 */
export { AnalyticsService };
