// convex/schema/boilerplate/dashboards/dashboards/types.ts
// Type extractions from validators for dashboards module

import { Infer } from 'convex/values';
import { dashboardsValidators } from './validators';

// Extract types from validators
export type DashboardLayout = Infer<typeof dashboardsValidators.layout>;
export type WidgetType = Infer<typeof dashboardsValidators.widgetType>;
export type ChartType = Infer<typeof dashboardsValidators.chartType>;
export type AggregationType = Infer<typeof dashboardsValidators.aggregation>;
export type FormatType = Infer<typeof dashboardsValidators.format>;
export type Widget = Infer<typeof dashboardsValidators.widget>;
