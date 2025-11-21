// convex/lib/system/analytics/analytics/index.ts
// Public API exports for analytics module

// Constants
export { ANALYTICS_CONSTANTS, METRIC_IMPORTANCE_WEIGHTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  // Validation functions
  validateDashboardData,
  validateReportData,
  validateEventData,
  validateMetricData,
  validateProviderConfigData,

  // Display & Formatting functions
  formatDashboardDisplayName,
  formatReportDisplayName,
  formatEventDisplayName,
  isDashboardEditable,
  isReportEditable,

  // Utility helpers
  generateSessionId,
  generateAnonymousId,
  hashIpAddress,
  parseUserAgent,
  getPeriodBoundaries,
  getDateRangeFromPreset,
  calculatePercentageChange,
  formatMetricValue,
  isValidDateRange,
  isSessionExpired,
  sanitizeEventProperties,
  generateMetricCacheKey,
  getNextAggregationTime,
  batchEvents,
  calculateRetentionRate,
  calculateChurnRate,
  extractDimensionValue,
  validateDashboardName,
  validateReportName,
  generateAnalyticsPublicId,
} from './utils';

// Permissions
export {
  // Events
  canViewAnalyticsEvents,
  requireViewAnalyticsEventsAccess,

  // Metrics
  canViewAnalyticsMetrics,
  requireViewAnalyticsMetricsAccess,

  // Dashboards
  canViewDashboard,
  canEditDashboard,
  canDeleteDashboard,
  requireViewDashboardAccess,
  requireEditDashboardAccess,
  requireDeleteDashboardAccess,

  // Reports
  canViewReport,
  canEditReport,
  canDeleteReport,
  requireViewReportAccess,
  requireEditReportAccess,
  requireDeleteReportAccess,

  // Providers
  canManageProviders,
  requireManageProvidersAccess,

  // Data export
  canExportAnalyticsData,
  canTrackAnonymousEvents,
  canAccessMetricType,

  // Bulk filtering
  filterDashboardsByAccess,
  filterReportsByAccess,
  filterEventsByAccess,
} from './permissions';

// Queries
export {
  getMetric,
  getAnalyticsSummary,
  getPageViews,
  getActiveSessions,
  getUniqueUsers,
  getDashboards,
  getDashboard,
  getReports,
  getReport,
  getEventsBySession,
  getUserEvents,
  getDashboardBySlug,
} from './queries';

// Mutations
export {
  trackEvent,
  trackPageView,
  upsertMetric,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  createReport,
  updateReport,
  deleteReport,
  upsertProviderConfig,
  updateProviderSyncStatus,
  markEventsSynced,
} from './mutations';
