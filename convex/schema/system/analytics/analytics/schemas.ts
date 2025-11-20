// convex/schema/boilerplate/analytics/analytics/schemas.ts
// Schema exports for analytics module

import {
  analyticsEventsTable,
  analyticsMetricsTable,
  analyticsDashboardsTable,
  analyticsReportsTable,
  analyticsProviderSyncTable,
} from './analytics';

export const boilerplateAnalyticsAnalyticsSchemas = {
  analyticsEvents: analyticsEventsTable,
  analyticsMetrics: analyticsMetricsTable,
  analyticsDashboards: analyticsDashboardsTable,
  analyticsReports: analyticsReportsTable,
  analyticsProviderSync: analyticsProviderSyncTable,
};
