// convex/schema/system/core/analytics/schemas.ts
// Schema exports for analytics module

import {
  analyticsEventsTable,
  analyticsMetricsTable,
  analyticsDashboardsTable,
  analyticsReportsTable,
  analyticsProviderSyncTable,
} from './tables';

export const systemAnalyticsSchemas = {
  analyticsEvents: analyticsEventsTable,
  analyticsMetrics: analyticsMetricsTable,
  analyticsDashboards: analyticsDashboardsTable,
  analyticsReports: analyticsReportsTable,
  analyticsProviderSync: analyticsProviderSyncTable,
};
