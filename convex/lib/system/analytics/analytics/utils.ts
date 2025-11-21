// convex/lib/system/analytics/analytics/utils.ts
// Utility functions for analytics module

import { ANALYTICS_CONSTANTS } from './constants';
import type { DeviceInfo } from './types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate dashboard data for creation/update
 */
export function validateDashboardData(
  data: Partial<{
    name?: string;
    description?: string;
    widgets?: any[];
  }>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Dashboard name is required');
    } else if (trimmed.length > ANALYTICS_CONSTANTS.LIMITS.MAX_DASHBOARD_NAME_LENGTH) {
      errors.push(`Dashboard name cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_DASHBOARD_NAME_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > ANALYTICS_CONSTANTS.LIMITS.MAX_DASHBOARD_DESCRIPTION_LENGTH) {
      errors.push(`Dashboard description cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_DASHBOARD_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate widgets
  if (data.widgets !== undefined) {
    if (data.widgets.length > ANALYTICS_CONSTANTS.LIMITS.MAX_WIDGETS_PER_DASHBOARD) {
      errors.push(`Cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_WIDGETS_PER_DASHBOARD} widgets per dashboard`);
    }
  }

  return errors;
}

/**
 * Validate report data for creation/update
 */
export function validateReportData(
  data: Partial<{
    name?: string;
    description?: string;
    query?: {
      metrics?: string[];
    };
    schedule?: {
      recipients?: string[];
    };
  }>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Report name is required');
    } else if (trimmed.length > ANALYTICS_CONSTANTS.LIMITS.MAX_REPORT_NAME_LENGTH) {
      errors.push(`Report name cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_REPORT_NAME_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > ANALYTICS_CONSTANTS.LIMITS.MAX_REPORT_DESCRIPTION_LENGTH) {
      errors.push(`Report description cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_REPORT_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate metrics count
  if (data.query?.metrics !== undefined) {
    if (data.query.metrics.length > ANALYTICS_CONSTANTS.LIMITS.MAX_METRICS_PER_REPORT) {
      errors.push(`Cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_METRICS_PER_REPORT} metrics per report`);
    }
  }

  // Validate recipients count
  if (data.schedule?.recipients !== undefined) {
    if (data.schedule.recipients.length > ANALYTICS_CONSTANTS.LIMITS.MAX_RECIPIENTS_PER_REPORT) {
      errors.push(`Cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_RECIPIENTS_PER_REPORT} recipients per report`);
    }
  }

  return errors;
}

/**
 * Validate event data for tracking
 */
export function validateEventData(
  data: Partial<{
    eventName?: string;
  }>
): string[] {
  const errors: string[] = [];

  // Validate event name
  if (data.eventName !== undefined) {
    const trimmed = data.eventName.trim();

    if (!trimmed) {
      errors.push('Event name is required');
    } else if (trimmed.length > ANALYTICS_CONSTANTS.LIMITS.MAX_EVENT_NAME_LENGTH) {
      errors.push(`Event name cannot exceed ${ANALYTICS_CONSTANTS.LIMITS.MAX_EVENT_NAME_LENGTH} characters`);
    }
  }

  return errors;
}

/**
 * Validate metric data for creation/update
 */
export function validateMetricData(
  data: Partial<{
    name?: string;
    metricType?: string;
  }>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Metric name is required');
    }
  }

  // Validate metric type
  if (data.metricType !== undefined) {
    const trimmed = data.metricType.trim();

    if (!trimmed) {
      errors.push('Metric type is required');
    }
  }

  return errors;
}

/**
 * Validate provider config data for creation/update
 */
export function validateProviderConfigData(
  data: Partial<{
    name?: string;
    provider?: string;
  }>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Provider config name is required');
    }
  }

  // Validate provider type
  if (data.provider !== undefined) {
    const trimmed = data.provider.trim();

    if (!trimmed) {
      errors.push('Provider type is required');
    }
  }

  return errors;
}

// ============================================================================
// Display & Formatting Functions
// ============================================================================

/**
 * Format dashboard display name
 */
export function formatDashboardDisplayName(dashboard: { name: string; status?: string }): string {
  const statusBadge = dashboard.status ? ` [${dashboard.status}]` : '';
  return `${dashboard.name}${statusBadge}`;
}

/**
 * Format report display name
 */
export function formatReportDisplayName(report: { name: string; status?: string }): string {
  const statusBadge = report.status ? ` [${report.status}]` : '';
  return `${report.name}${statusBadge}`;
}

/**
 * Format event display name
 */
export function formatEventDisplayName(event: { eventName: string; eventType?: string }): string {
  const typeBadge = event.eventType ? ` [${event.eventType}]` : '';
  return `${event.eventName}${typeBadge}`;
}

/**
 * Check if dashboard is editable
 */
export function isDashboardEditable(dashboard: { status: string; deletedAt?: number }): boolean {
  if (dashboard.deletedAt) return false;
  return dashboard.status !== 'archived';
}

/**
 * Check if report is editable
 */
export function isReportEditable(report: { status: string; deletedAt?: number }): boolean {
  if (report.deletedAt) return false;
  return report.status !== 'archived';
}

// ============================================================================
// Utility Helper Functions
// ============================================================================

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Generate anonymous ID for non-logged-in users
 */
export function generateAnonymousId(): string {
  return `anon_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

/**
 * Hash IP address for privacy
 */
export function hashIpAddress(ip: string): string {
  // Simple hash - in production, use a proper hashing function
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `ip_${Math.abs(hash).toString(36)}`;
}

/**
 * Parse user agent to extract browser and OS
 */
export function parseUserAgent(userAgent: string): DeviceInfo {
  const ua = userAgent.toLowerCase();

  // Detect browser
  let browser: string | undefined;
  if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edge')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // Detect OS
  let os: string | undefined;
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad'))
    os = 'iOS';

  // Detect device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' | undefined;
  if (
    ua.includes('mobile') ||
    ua.includes('android') ||
    ua.includes('iphone')
  ) {
    deviceType = 'mobile';
  } else if (ua.includes('tablet') || ua.includes('ipad')) {
    deviceType = 'tablet';
  } else {
    deviceType = 'desktop';
  }

  return { userAgent, browser, os, deviceType };
}

/**
 * Get period boundaries for aggregation
 */
export function getPeriodBoundaries(
  timestamp: number,
  period: 'hour' | 'day' | 'week' | 'month'
): {
  start: number;
  end: number;
} {
  const date = new Date(timestamp);

  switch (period) {
    case 'hour': {
      const start = new Date(date);
      start.setMinutes(0, 0, 0);
      const end = new Date(start);
      end.setHours(end.getHours() + 1);
      return { start: start.getTime(), end: end.getTime() };
    }

    case 'day': {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start: start.getTime(), end: end.getTime() };
    }

    case 'week': {
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start: start.getTime(), end: end.getTime() };
    }

    case 'month': {
      const start = new Date(date);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      return { start: start.getTime(), end: end.getTime() };
    }
  }
}

/**
 * Get date range from preset
 */
export function getDateRangeFromPreset(preset: string): {
  start: number;
  end: number;
} {
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  switch (preset) {
    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.TODAY:
      return {
        start: today.getTime(),
        end: now,
      };

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.YESTERDAY: {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
      return {
        start: yesterday.getTime(),
        end: endOfYesterday.getTime(),
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.LAST_7_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 7);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.LAST_30_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 30);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.LAST_90_DAYS: {
      const start = new Date(today);
      start.setDate(start.getDate() - 90);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.THIS_MONTH: {
      const start = new Date(today);
      start.setDate(1);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.LAST_MONTH: {
      const start = new Date(today);
      start.setMonth(start.getMonth() - 1);
      start.setDate(1);
      const end = new Date(today);
      end.setDate(0); // Last day of previous month
      end.setHours(23, 59, 59, 999);
      return {
        start: start.getTime(),
        end: end.getTime(),
      };
    }

    case ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.THIS_YEAR: {
      const start = new Date(today);
      start.setMonth(0, 1);
      return {
        start: start.getTime(),
        end: now,
      };
    }

    default:
      // Default to last 30 days
      return getDateRangeFromPreset(ANALYTICS_CONSTANTS.DATE_RANGE_PRESETS.LAST_30_DAYS);
  }
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format metric value for display
 */
export function formatMetricValue(
  value: number,
  metricType: string
): string {
  // Currency formatting
  if (
    metricType.includes('cost') ||
    metricType.includes('revenue') ||
    metricType.includes('mrr')
  ) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  }

  // Percentage formatting
  if (metricType.includes('rate') || metricType.includes('percent')) {
    return `${value.toFixed(2)}%`;
  }

  // Duration formatting (milliseconds)
  if (
    metricType.includes('latency') ||
    metricType.includes('duration') ||
    metricType.includes('time')
  ) {
    if (value < 1000) return `${Math.round(value)}ms`;
    return `${(value / 1000).toFixed(2)}s`;
  }

  // Default number formatting
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

/**
 * Validate date range
 */
export function isValidDateRange(start: number, end: number): boolean {
  return start < end && start > 0 && end <= Date.now();
}

/**
 * Check if session is expired
 */
export function isSessionExpired(lastActivityTime: number): boolean {
  return Date.now() - lastActivityTime > ANALYTICS_CONSTANTS.CONFIG.SESSION_TIMEOUT_MS;
}

/**
 * Sanitize event properties to remove sensitive data
 */
export function sanitizeEventProperties(
  properties: Record<string, any>
): Record<string, any> {
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'apiKey',
    'creditCard',
    'ssn',
    'pin',
  ];

  const sanitized = { ...properties };

  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  }

  return sanitized;
}

/**
 * Generate metric cache key
 */
export function generateMetricCacheKey(
  metricType: string,
  period: 'hour' | 'day' | 'week' | 'month',
  periodStart: number,
  dimension?: string
): string {
  const parts = [metricType, period, periodStart.toString()];
  if (dimension) parts.push(dimension);
  return parts.join(':');
}

/**
 * Calculate next aggregation time
 */
export function getNextAggregationTime(period: 'hour' | 'day' | 'week' | 'month'): number {
  const now = Date.now();
  const { end } = getPeriodBoundaries(now, period);
  return end;
}

/**
 * Batch events for efficient processing
 */
export function batchEvents<T>(
  events: T[],
  batchSize: number = ANALYTICS_CONSTANTS.CONFIG.BATCH_SIZE
): T[][] {
  const batches: T[][] = [];
  for (let i = 0; i < events.length; i += batchSize) {
    batches.push(events.slice(i, i + batchSize));
  }
  return batches;
}

/**
 * Calculate retention rate
 */
export function calculateRetentionRate(
  activeUsers: number,
  totalUsers: number
): number {
  if (totalUsers === 0) return 0;
  return (activeUsers / totalUsers) * 100;
}

/**
 * Calculate churn rate
 */
export function calculateChurnRate(
  cancelledSubscriptions: number,
  totalSubscriptions: number
): number {
  if (totalSubscriptions === 0) return 0;
  return (cancelledSubscriptions / totalSubscriptions) * 100;
}

/**
 * Extract dimension value from event properties
 */
export function extractDimensionValue(
  properties: Record<string, any>,
  dimension: string
): string | undefined {
  return properties[dimension]?.toString();
}

/**
 * Validate dashboard name
 */
export function validateDashboardName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= ANALYTICS_CONSTANTS.LIMITS.MAX_DASHBOARD_NAME_LENGTH
  );
}

/**
 * Validate report name
 */
export function validateReportName(name: string): boolean {
  const trimmed = name.trim();
  return (
    trimmed.length > 0 &&
    trimmed.length <= ANALYTICS_CONSTANTS.LIMITS.MAX_REPORT_NAME_LENGTH
  );
}

/**
 * Generate public ID for analytics entities
 */
export function generateAnalyticsPublicId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}
