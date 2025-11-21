// convex/lib/system/analytics/analytics/permissions.ts
// Access control functions for analytics module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';
import { ANALYTICS_CONSTANTS } from './constants';

// ============================================================================
// Analytics Events Access
// ============================================================================

/**
 * Check if user can view analytics events
 */
export async function canViewAnalyticsEvents(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // Admins and superadmins can always view
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Regular users can view their own analytics events
  return true;
}

export async function requireViewAnalyticsEventsAccess(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canViewAnalyticsEvents(ctx, user))) {
    throw new Error('You do not have permission to view analytics events');
  }
}

// ============================================================================
// Analytics Metrics Access
// ============================================================================

/**
 * Check if user can view analytics metrics
 */
export async function canViewAnalyticsMetrics(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // Admins and superadmins can always view
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Regular users can view metrics
  return true;
}

export async function requireViewAnalyticsMetricsAccess(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canViewAnalyticsMetrics(ctx, user))) {
    throw new Error('You do not have permission to view analytics metrics');
  }
}

// ============================================================================
// Dashboard Access
// ============================================================================

/**
 * Check if user can view a dashboard
 */
export async function canViewDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public dashboards can be viewed by anyone
  if (dashboard.isPublic) {
    return true;
  }

  // Owner can view
  if (dashboard.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (dashboard.createdBy === user._id) {
    return true;
  }

  return false;
}

export async function requireViewDashboardAccess(
  ctx: QueryCtx | MutationCtx,
  dashboard: Doc<'analyticsDashboards'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canViewDashboard(ctx, user, dashboard))) {
    throw new Error('You do not have permission to view this dashboard');
  }
}

/**
 * Check if user can edit a dashboard
 */
export async function canEditDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (dashboard.ownerId === user._id) {
    return true;
  }

  // Check if dashboard is archived
  if (dashboard.status === 'archived') {
    // Only admins can edit archived items
    return false;
  }

  return false;
}

export async function requireEditDashboardAccess(
  ctx: QueryCtx | MutationCtx,
  dashboard: Doc<'analyticsDashboards'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canEditDashboard(ctx, user, dashboard))) {
    throw new Error('You do not have permission to edit this dashboard');
  }
}

/**
 * Check if user can delete a dashboard
 */
export async function canDeleteDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }
  if (dashboard.ownerId === user._id) {
    return true;
  }
  return false;
}

export async function requireDeleteDashboardAccess(
  dashboard: Doc<'analyticsDashboards'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canDeleteDashboard({} as any, user, dashboard))) {
    throw new Error('You do not have permission to delete this dashboard');
  }
}

// ============================================================================
// Report Access
// ============================================================================

/**
 * Check if user can view a report
 */
export async function canViewReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Public reports can be viewed by anyone
  if (report.isPublic) {
    return true;
  }

  // Owner can view
  if (report.ownerId === user._id) {
    return true;
  }

  // Creator can view
  if (report.createdBy === user._id) {
    return true;
  }

  return false;
}

export async function requireViewReportAccess(
  ctx: QueryCtx | MutationCtx,
  report: Doc<'analyticsReports'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canViewReport(ctx, user, report))) {
    throw new Error('You do not have permission to view this report');
  }
}

/**
 * Check if user can edit a report
 */
export async function canEditReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Owner can edit
  if (report.ownerId === user._id) {
    return true;
  }

  // Check if report is archived
  if (report.status === 'archived') {
    // Only admins can edit archived items
    return false;
  }

  return false;
}

export async function requireEditReportAccess(
  ctx: QueryCtx | MutationCtx,
  report: Doc<'analyticsReports'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canEditReport(ctx, user, report))) {
    throw new Error('You do not have permission to edit this report');
  }
}

/**
 * Check if user can delete a report
 */
export async function canDeleteReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Only admins and owners can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }
  if (report.ownerId === user._id) {
    return true;
  }
  return false;
}

export async function requireDeleteReportAccess(
  report: Doc<'analyticsReports'>,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canDeleteReport({} as any, user, report))) {
    throw new Error('You do not have permission to delete this report');
  }
}

// ============================================================================
// Provider Configuration Access
// ============================================================================

/**
 * Check if user can manage analytics providers
 */
export async function canManageProviders(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // Only admins and superadmins can manage providers
  return user.role === 'admin' || user.role === 'superadmin';
}

export async function requireManageProvidersAccess(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<void> {
  if (!(await canManageProviders(ctx, user))) {
    throw new Error('You do not have permission to manage analytics providers');
  }
}

// ============================================================================
// Data Export Access
// ============================================================================

/**
 * Check if user can export analytics data
 */
export async function canExportAnalyticsData(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // Admins and superadmins can export
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Regular users can export their own data
  return true;
}

/**
 * Check if user can track anonymous events
 */
export async function canTrackAnonymousEvents(): boolean {
  // Anonymous event tracking is allowed for all
  return true;
}

/**
 * Check if user has access to specific metric types
 */
export async function canAccessMetricType(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  metricType: string
): Promise<boolean> {
  // Sensitive metrics (cost, revenue) restricted to admins
  const sensitiveMetrics = [
    ANALYTICS_CONSTANTS.COMMON_METRICS.REVENUE,
    ANALYTICS_CONSTANTS.COMMON_METRICS.MRR,
    ANALYTICS_CONSTANTS.COMMON_METRICS.AI_COST,
  ];

  if (sensitiveMetrics.includes(metricType)) {
    return user.role === 'admin' || user.role === 'superadmin';
  }

  // All other metrics are accessible
  return true;
}

/**
 * Filter dashboards based on user access
 */
export function filterDashboardsByAccess(
  dashboards: Doc<'analyticsDashboards'>[],
  user: Doc<'userProfiles'>
): Doc<'analyticsDashboards'>[] {
  return dashboards.filter((dashboard) => {
    // Owner can access
    if (dashboard.ownerId === user._id) {
      return true;
    }

    // Public dashboards
    if (dashboard.isPublic) {
      return true;
    }

    // Admins can access all
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }

    return false;
  });
}

/**
 * Filter reports based on user access
 */
export function filterReportsByAccess(
  reports: Doc<'analyticsReports'>[],
  user: Doc<'userProfiles'>
): Doc<'analyticsReports'>[] {
  return reports.filter((report) => {
    // Owner can access
    if (report.ownerId === user._id) {
      return true;
    }

    // Public reports
    if (report.isPublic) {
      return true;
    }

    // Admins can access all
    if (user.role === 'admin' || user.role === 'superadmin') {
      return true;
    }

    return false;
  });
}

/**
 * Filter analytics events based on user access
 */
export function filterEventsByAccess(
  events: Doc<'analyticsEvents'>[],
  user: Doc<'userProfiles'>
): Doc<'analyticsEvents'>[] {
  // Admins can see all events
  if (user.role === 'admin' || user.role === 'superadmin') {
    return events;
  }

  // Regular users can only see their own events
  return events.filter((event) => event.userId === user._id);
}
