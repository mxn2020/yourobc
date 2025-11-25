// convex/schema/system/dashboards/types.ts
// Type extractions from validators for dashboards module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { dashboardsFields, dashboardsValidators } from './validators';
import { dashboardsTable } from './tables';

// ============================================
// Document Types
// ============================================

export type Dashboard = Doc<'dashboards'>;
export type DashboardId = Id<'dashboards'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type DashboardSchema = Infer<typeof dashboardsTable.validator>;

// ============================================
// Field Types (from validators)
// ============================================

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

