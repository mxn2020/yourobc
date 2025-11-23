// convex/schema/system/analytics/validators.ts
// Grouped validators for analytics module

import { baseValidators } from '@/schema/base.validators';
import { v } from 'convex/values';

export const analyticsValidators = {
  // Event types
  eventType: v.union(
    v.literal('page_view'),
    v.literal('user_action'),
    v.literal('ai_usage'),
    v.literal('payment'),
    v.literal('error'),
    v.literal('custom')
  ),

  // Device types
  deviceType: v.union(
    v.literal('desktop'),
    v.literal('mobile'),
    v.literal('tablet')
  ),

  // Sync status
  syncStatus: v.union(
    v.literal('pending'),
    v.literal('synced'),
    v.literal('failed')
  ),

  // Metric periods
  metricPeriod: v.union(
    v.literal('hour'),
    v.literal('day'),
    v.literal('week'),
    v.literal('month')
  ),

  // Dashboard types
  dashboardType: v.union(
    v.literal('overview'),
    v.literal('ai_usage'),
    v.literal('payments'),
    v.literal('user_behavior'),
    v.literal('performance'),
    v.literal('custom')
  ),

  // Widget types
  widgetType: v.union(
    v.literal('line_chart'),
    v.literal('bar_chart'),
    v.literal('pie_chart'),
    v.literal('metric'),
    v.literal('table'),
    v.literal('heatmap')
  ),

  // Report types
  reportType: v.union(
    v.literal('usage_summary'),
    v.literal('cost_analysis'),
    v.literal('user_activity'),
    v.literal('performance'),
    v.literal('custom')
  ),

  // Report frequency
  reportFrequency: v.union(
    v.literal('daily'),
    v.literal('weekly'),
    v.literal('monthly')
  ),

  // Export formats
  exportFormat: v.union(v.literal('csv'), v.literal('json'), v.literal('pdf')),

  // Analytics providers
  analyticsProvider: v.union(
    v.literal('internal'),
    v.literal('google_analytics'),
    v.literal('mixpanel'),
    v.literal('plausible')
  ),

  // Sync direction
  syncDirection: v.union(
    v.literal('export'),
    v.literal('import'),
    v.literal('bidirectional')
  ),

  // Payment status
  paymentStatus: v.union(
    v.literal('pending'),
    v.literal('completed'),
    v.literal('failed'),
    v.literal('refunded')
  ),

  // Error severity
  errorSeverity: v.union(
    v.literal('low'),
    v.literal('medium'),
    v.literal('high'),
    v.literal('critical')
  ),

  // Filter operators
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

  // Transform types
  transformType: v.union(
    v.literal('rename'),
    v.literal('map'),
    v.literal('compute'),
    v.literal('filter')
  ),

  // Chart format types
  chartFormat: v.union(
    v.literal('number'),
    v.literal('currency'),
    v.literal('percentage'),
    v.literal('date')
  ),

  // Color schemes
  colorScheme: v.union(
    v.literal('blue'),
    v.literal('green'),
    v.literal('red'),
    v.literal('purple')
  ),

  // Last sync status for providers
  lastSyncStatus: v.union(
    v.literal('success'),
    v.literal('partial'),
    v.literal('error')
  ),
} as const;

const analyticsFilterCondition = v.object({
  field: v.string(),
  operator: analyticsValidators.filterOperator,
  value: v.union(
    v.string(),
    v.number(),
    v.boolean(),
    v.array(v.string()),
    v.array(v.number())
  ),
});

const analyticsFilterGroup = v.object({
  conditions: v.array(analyticsFilterCondition),
  combinator: v.union(v.literal('and'), v.literal('or')),
});

const analyticsDateRange = v.object({
  start: v.number(),
  end: v.number(),
});

const pageViewProperties = v.object({
  eventType: v.literal('page_view'),
  duration: v.optional(v.number()),
  scrollDepth: v.optional(v.number()),
  exitPage: v.optional(v.boolean()),
});

const userActionProperties = v.object({
  eventType: v.literal('user_action'),
  action: v.string(),
  category: v.optional(v.string()),
  label: v.optional(v.string()),
  target: v.optional(v.string()),
  buttonText: v.optional(v.string()),
  formId: v.optional(v.string()),
});

const aiUsageProperties = v.object({
  eventType: v.literal('ai_usage'),
  modelId: v.string(),
  modelName: v.string(),
  provider: v.string(),
  promptTokens: v.number(),
  completionTokens: v.number(),
  totalTokens: v.number(),
  cost: v.number(),
  latency: v.number(),
  success: v.boolean(),
  errorCode: v.optional(v.string()),
  errorMessage: v.optional(v.string()),
});

const paymentProperties = v.object({
  eventType: v.literal('payment'),
  transactionId: v.string(),
  amount: v.number(),
  currency: v.string(),
  paymentMethod: baseValidators.paymentMethod,
  status: analyticsValidators.paymentStatus,
  subscriptionId: v.optional(v.string()),
  planName: v.optional(v.string()),
});

const errorProperties = v.object({
  eventType: v.literal('error'),
  errorType: v.string(),
  errorMessage: v.string(),
  errorStack: v.optional(v.string()),
  statusCode: v.optional(v.number()),
  url: v.optional(v.string()),
  componentName: v.optional(v.string()),
  severity: analyticsValidators.errorSeverity,
});

const customProperties = v.object({
  eventType: v.literal('custom'),
  category: v.string(),
  data: v.record(v.string(), v.union(v.string(), v.number(), v.boolean())),
});

const analyticsWidgetConfig = v.union(
  v.object({
    type: v.literal('line_chart'),
    showLegend: v.optional(v.boolean()),
    showGrid: v.optional(v.boolean()),
    colors: v.optional(v.array(v.string())),
    smooth: v.optional(v.boolean()),
    stacked: v.optional(v.boolean()),
  }),
  v.object({
    type: v.literal('bar_chart'),
    showLegend: v.optional(v.boolean()),
    showGrid: v.optional(v.boolean()),
    colors: v.optional(v.array(v.string())),
    horizontal: v.optional(v.boolean()),
    stacked: v.optional(v.boolean()),
  }),
  v.object({
    type: v.literal('pie_chart'),
    showLegend: v.optional(v.boolean()),
    showValues: v.optional(v.boolean()),
    colors: v.optional(v.array(v.string())),
    donut: v.optional(v.boolean()),
  }),
  v.object({
    type: v.literal('metric'),
    showTrend: v.optional(v.boolean()),
    showComparison: v.optional(v.boolean()),
    format: v.optional(analyticsValidators.chartFormat),
    precision: v.optional(v.number()),
  }),
  v.object({
    type: v.literal('table'),
    showPagination: v.optional(v.boolean()),
    pageSize: v.optional(v.number()),
    sortable: v.optional(v.boolean()),
    columns: v.optional(
      v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          format: v.optional(analyticsValidators.chartFormat),
        })
      )
    ),
  }),
  v.object({
    type: v.literal('heatmap'),
    colorScheme: v.optional(analyticsValidators.colorScheme),
    showValues: v.optional(v.boolean()),
  })
);

const analyticsWidget = v.object({
  id: v.string(),
  type: analyticsValidators.widgetType,
  title: v.string(),
  query: v.object({
    metricType: v.string(),
    dimension: v.optional(v.string()),
    filters: v.optional(analyticsFilterGroup),
    dateRange: v.optional(analyticsDateRange),
  }),
  position: v.object({
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
  }),
  config: v.optional(analyticsWidgetConfig),
});

const analyticsReportQuery = v.object({
  metrics: v.array(v.string()),
  dimensions: v.optional(v.array(v.string())),
  filters: v.optional(analyticsFilterGroup),
  dateRange: analyticsDateRange,
});

const analyticsReportSchedule = v.object({
  enabled: v.boolean(),
  frequency: analyticsValidators.reportFrequency,
  time: v.string(),
  recipients: v.array(v.string()),
  lastRun: v.optional(v.number()),
  nextRun: v.optional(v.number()),
});

const analyticsReportResult = v.object({
  data: v.array(
    v.record(v.string(), v.union(v.string(), v.number(), v.boolean(), v.null()))
  ),
  generatedAt: v.number(),
  rowCount: v.number(),
});

const analyticsProviderConfig = v.union(
  v.object({
    provider: v.literal('google_analytics'),
    measurementId: v.string(),
    apiSecret: v.string(),
    propertyId: v.optional(v.string()),
  }),
  v.object({
    provider: v.literal('mixpanel'),
    token: v.string(),
    apiSecret: v.optional(v.string()),
    projectId: v.optional(v.string()),
  }),
  v.object({
    provider: v.literal('plausible'),
    domain: v.string(),
    apiKey: v.optional(v.string()),
  }),
  v.object({
    provider: v.literal('internal'),
    enableBatching: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  })
);

const analyticsEventMapping = v.array(
  v.object({
    internalEvent: v.string(),
    externalEvent: v.string(),
    transform: v.optional(
      v.array(
        v.object({
          sourceField: v.string(),
          targetField: v.string(),
          transformType: analyticsValidators.transformType,
          mapping: v.optional(
            v.record(v.string(), v.union(v.string(), v.number(), v.boolean()))
          ),
          computeExpression: v.optional(v.string()),
        })
      )
    ),
  })
);

export const analyticsFields = {
  pageViewProperties,
  userActionProperties,
  aiUsageProperties,
  paymentProperties,
  errorProperties,
  customProperties,
  eventProperties: v.union(
    pageViewProperties,
    userActionProperties,
    aiUsageProperties,
    paymentProperties,
    errorProperties,
    customProperties
  ),
  filterCondition: analyticsFilterCondition,
  filterGroup: analyticsFilterGroup,
  dateRange: analyticsDateRange,
  widgetConfig: analyticsWidgetConfig,
  dashboardWidget: analyticsWidget,
  reportQuery: analyticsReportQuery,
  reportSchedule: analyticsReportSchedule,
  reportResult: analyticsReportResult,
  providerConfig: analyticsProviderConfig,
  eventMappings: analyticsEventMapping,
} as const;
