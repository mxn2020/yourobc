// convex/lib/system/dashboards/dashboards/constants.ts
// Business constants, permissions, and limits for dashboards module

export const DASHBOARDS_CONSTANTS = {
  // Permissions
  PERMISSIONS: {
    VIEW: 'dashboards:view',
    CREATE: 'dashboards:create',
    EDIT: 'dashboards:edit',
    UPDATE: 'dashboards:update',
    DELETE: 'dashboards:delete',
    VIEW_ALL: 'dashboards:view_all',
    BULK_EDIT: 'dashboards:bulk_edit',
  },

  // Standard Status (required by guide)
  STATUS: {
    ACTIVE: 'active',
    ARCHIVED: 'archived',
    DRAFT: 'draft',
  } as const,

  // Priority Levels
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  } as const,

  // Visibility Levels
  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  } as const,

  // Layout Types
  LAYOUT: {
    GRID: 'grid',
    FREEFORM: 'freeform',
  } as const,

  // Widget Types
  WIDGET_TYPE: {
    METRIC: 'metric',
    CHART: 'chart',
    TABLE: 'table',
    KPI: 'kpi',
    TEXT: 'text',
    IMAGE: 'image',
    IFRAME: 'iframe',
  } as const,

  // Chart Types
  CHART_TYPE: {
    LINE: 'line',
    BAR: 'bar',
    PIE: 'pie',
    DOUGHNUT: 'doughnut',
    AREA: 'area',
    SCATTER: 'scatter',
  } as const,

  // Aggregation Types
  AGGREGATION: {
    SUM: 'sum',
    AVG: 'avg',
    COUNT: 'count',
    MIN: 'min',
    MAX: 'max',
  } as const,

  // Format Types
  FORMAT: {
    NUMBER: 'number',
    CURRENCY: 'currency',
    PERCENTAGE: 'percentage',
    DATE: 'date',
  } as const,

  // Default Values
  DEFAULT_VALUES: {
    STATUS: 'active' as const,
    LAYOUT: 'grid' as const,
    IS_DEFAULT: false,
    IS_PUBLIC: false,
    VISIBILITY: 'private' as const,
    WIDGETS: [],
  },

  // Validation Limits
  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 1,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_TAGS: 10,
    MAX_TAG_LENGTH: 30,
    MAX_WIDGETS: 50,
  },

  // Validation Patterns
  VALIDATION: {
    NAME_MIN_LENGTH: 1,
  },
} as const;
