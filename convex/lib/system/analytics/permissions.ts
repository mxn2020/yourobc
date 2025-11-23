// convex/lib/system/analytics/permissions.ts
// Access control functions for analytics module

import { QueryCtx, MutationCtx } from '@/generated/server';
import { Doc, Id } from '@/generated/dataModel';
import { ANALYTICS_CONSTANTS } from './constants';

/**
 * Check if user can view analytics events
 */
export async function canViewAnalyticsEvents(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // Admins and superadmins can always view all events
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Regular users can only view their own events (must be checked at query level)
  // This function assumes filtering by userId is done in the query
  return user.role !== undefined;
}

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

/**
 * Check if user can view a dashboard
 */
export async function canViewDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Owner can view
  if (dashboard.ownerId === user._id) {
    return true;
  }

  // Public dashboards can be viewed by anyone
  if (dashboard.isPublic) {
    return true;
  }

  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

/**
 * Check if user can create dashboards
 */
export async function canCreateDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create dashboards
  return true;
}

/**
 * Check if user can edit a dashboard
 */
export async function canEditDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Owner can edit
  if (dashboard.ownerId === user._id) {
    return true;
  }

  // Admins and superadmins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a dashboard
 */
export async function canDeleteDashboard(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  dashboard: Doc<'analyticsDashboards'>
): Promise<boolean> {
  // Owner can delete
  if (dashboard.ownerId === user._id) {
    return true;
  }

  // Admins and superadmins can delete all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

/**
 * Check if user can view a report
 */
export async function canViewReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Owner can view
  if (report.ownerId === user._id) {
    return true;
  }

  // Public reports can be viewed by anyone
  if (report.isPublic) {
    return true;
  }

  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

/**
 * Check if user can create reports
 */
export async function canCreateReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>
): Promise<boolean> {
  // All authenticated users can create reports
  return true;
}

/**
 * Check if user can edit a report
 */
export async function canEditReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Owner can edit
  if (report.ownerId === user._id) {
    return true;
  }

  // Admins and superadmins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

/**
 * Check if user can delete a report
 */
export async function canDeleteReport(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  report: Doc<'analyticsReports'>
): Promise<boolean> {
  // Owner can delete
  if (report.ownerId === user._id) {
    return true;
  }

  // Admins and superadmins can delete all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

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
export async function canTrackAnonymousEvents(): Promise<boolean> {
  // Anonymous event tracking is allowed for all
  return true;
}

/**
 * Check if user has access to specific metric types
 */
export async function canAccessMetricType(
  ctx: QueryCtx | MutationCtx,
  user: Doc<'userProfiles'>,
  metricType: keyof typeof ANALYTICS_CONSTANTS.COMMON_METRICS
): Promise<boolean> {
  // Sensitive metrics (cost, revenue) restricted to admins
  const sensitiveMetrics: (keyof typeof ANALYTICS_CONSTANTS.COMMON_METRICS)[] = [
    'DAILY_ACTIVE_USERS',
    'WEEKLY_ACTIVE_USERS',
    'MONTHLY_ACTIVE_USERS',
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
