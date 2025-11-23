// convex/schema/system/analytics/schemas.ts
// Schema exports for analytics module

import {
  analyticsEventsTable,
  analyticsMetricsTable,
  analyticsDashboardsTable,
  analyticsReportsTable,
  analyticsProviderSyncTable,
} from './analytics';

export const systemAnalyticsSchemas = {
  analyticsEvents: analyticsEventsTable,
  analyticsMetrics: analyticsMetricsTable,
  analyticsDashboards: analyticsDashboardsTable,
  analyticsReports: analyticsReportsTable,
  analyticsProviderSync: analyticsProviderSyncTable,
};
