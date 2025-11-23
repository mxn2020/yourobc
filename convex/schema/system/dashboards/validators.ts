// convex/schema/system/dashboards/validators.ts
// Grouped validators for dashboards module

import { v } from 'convex/values';

// Primitive unions
export const dashboardsValidators = {
  layout: v.union(v.literal('grid'), v.literal('freeform')),

  widgetType: v.union(
    v.literal('metric'),
    v.literal('chart'),
    v.literal('table'),
    v.literal('kpi'),
    v.literal('text'),
    v.literal('image'),
    v.literal('iframe')
  ),

  chartType: v.union(
    v.literal('line'),
    v.literal('bar'),
    v.literal('pie'),
    v.literal('doughnut'),
    v.literal('area'),
    v.literal('scatter')
  ),

  aggregation: v.union(
    v.literal('sum'),
    v.literal('avg'),
    v.literal('count'),
    v.literal('min'),
    v.literal('max')
  ),

  format: v.union(
    v.literal('number'),
    v.literal('currency'),
    v.literal('percentage'),
    v.literal('date')
  ),

  filterOperator: v.union(
    v.literal('eq'),
    v.literal('neq'),
    v.literal('gt'),
    v.literal('lt'),
    v.literal('gte'),
    v.literal('lte'),
    v.literal('in'),
    v.literal('contains'),
    v.literal('startsWith'),
    v.literal('endsWith')
  ),
} as const;

// Complex object schemas
const filterCondition = v.object({
  field: v.string(),
  operator: dashboardsValidators.filterOperator,
  value: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.string()),
    v.array(v.number())
  ),
});

const filterGroup = v.object({
  combinator: v.union(v.literal('and'), v.literal('or')),
  conditions: v.array(filterCondition),
});

const widgetPosition = v.object({
  x: v.number(),
  y: v.number(),
  w: v.number(),
  h: v.number(),
});

const widgetConfig = v.object({
  chartType: v.optional(dashboardsValidators.chartType),
  metrics: v.optional(v.array(v.string())),
  dimensions: v.optional(v.array(v.string())),
  aggregation: v.optional(dashboardsValidators.aggregation),
  colors: v.optional(v.array(v.string())),
  showLegend: v.optional(v.boolean()),
  showGrid: v.optional(v.boolean()),
  format: v.optional(dashboardsValidators.format),
  text: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
  iframeUrl: v.optional(v.string()),
});

const widget = v.object({
  id: v.string(),
  type: dashboardsValidators.widgetType,
  title: v.string(),
  config: v.optional(widgetConfig),
  position: widgetPosition,
  dataSource: v.optional(v.string()),
  refreshInterval: v.optional(v.number()),
  filters: v.optional(filterGroup),
});

export const dashboardsFields = {
  filterCondition,
  filterGroup,
  widgetPosition,
  widgetConfig,
  widget,
} as const;
