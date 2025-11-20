// convex/schema/boilerplate/dashboards/dashboards/validators.ts
// Grouped validators for dashboards module

import { v } from 'convex/values';

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

  widget: v.object({
    id: v.string(),
    type: v.union(
      v.literal('metric'),
      v.literal('chart'),
      v.literal('table'),
      v.literal('kpi'),
      v.literal('text'),
      v.literal('image'),
      v.literal('iframe')
    ),
    title: v.string(),
    config: v.object({
      chartType: v.optional(
        v.union(
          v.literal('line'),
          v.literal('bar'),
          v.literal('pie'),
          v.literal('doughnut'),
          v.literal('area'),
          v.literal('scatter')
        )
      ),
      metrics: v.optional(v.array(v.string())),
      dimensions: v.optional(v.array(v.string())),
      aggregation: v.optional(
        v.union(
          v.literal('sum'),
          v.literal('avg'),
          v.literal('count'),
          v.literal('min'),
          v.literal('max')
        )
      ),
      colors: v.optional(v.array(v.string())),
      showLegend: v.optional(v.boolean()),
      showGrid: v.optional(v.boolean()),
      format: v.optional(
        v.union(
          v.literal('number'),
          v.literal('currency'),
          v.literal('percentage'),
          v.literal('date')
        )
      ),
      text: v.optional(v.string()),
      imageUrl: v.optional(v.string()),
      iframeUrl: v.optional(v.string()),
    }),
    position: v.object({
      x: v.number(),
      y: v.number(),
      w: v.number(),
      h: v.number(),
    }),
    dataSource: v.optional(v.string()),
    refreshInterval: v.optional(v.number()),
    filters: v.optional(v.any()),
  }),
} as const;
