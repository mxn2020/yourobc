// convex/schema/system/dashboards/types.ts
// Type extractions from validators for dashboards module

import { Infer } from 'convex/values';
import { dashboardsFields, dashboardsValidators } from './validators';

// Extract types from validators
export type DashboardLayout = Infer<typeof dashboardsValidators.layout>;
export type WidgetType = Infer<typeof dashboardsValidators.widgetType>;
export type ChartType = Infer<typeof dashboardsValidators.chartType>;
export type AggregationType = Infer<typeof dashboardsValidators.aggregation>;
export type FormatType = Infer<typeof dashboardsValidators.format>;
export type DashboardFilterCondition = Infer<typeof dashboardsFields.filterCondition>;
export type DashboardFilterGroup = Infer<typeof dashboardsFields.filterGroup>;
export type DashboardWidgetPosition = Infer<typeof dashboardsFields.widgetPosition>;
export type DashboardWidgetConfig = Infer<typeof dashboardsFields.widgetConfig>;
export type DashboardWidget = Infer<typeof dashboardsFields.widget>;
// Backwards-compatible alias
export type Widget = DashboardWidget;
