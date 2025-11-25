// convex/lib/system/analytics/constants.ts
// Business constants, permissions, and limits for analytics module

export const ANALYTICS_CONSTANTS = {
  PERMISSIONS: {
    VIEW_EVENTS: 'analytics:view_events',
    TRACK_EVENTS: 'analytics:track_events',
    VIEW_METRICS: 'analytics:view_metrics',
    VIEW_DASHBOARDS: 'analytics:view_dashboards',
    CREATE_DASHBOARDS: 'analytics:create_dashboards',
    EDIT_DASHBOARDS: 'analytics:edit_dashboards',
    DELETE_DASHBOARDS: 'analytics:delete_dashboards',
    VIEW_REPORTS: 'analytics:view_reports',
    CREATE_REPORTS: 'analytics:create_reports',
    EDIT_REPORTS: 'analytics:edit_reports',
    DELETE_REPORTS: 'analytics:delete_reports',
    MANAGE_PROVIDERS: 'analytics:manage_providers',
    EXPORT_DATA: 'analytics:export_data',
  },

  LIMITS: {
    MAX_DASHBOARD_NAME_LENGTH: 100,
    MAX_DASHBOARD_DESCRIPTION_LENGTH: 500,
    MAX_REPORT_NAME_LENGTH: 100,
    MAX_REPORT_DESCRIPTION_LENGTH: 500,
    MAX_WIDGETS_PER_DASHBOARD: 20,
    MAX_METRICS_PER_REPORT: 50,
    MAX_RECIPIENTS_PER_REPORT: 50,
    MAX_EVENT_NAME_LENGTH: 100,
    MAX_TAGS_PER_EVENT: 10,
  },

  CONFIG: {
    // Event batching
    BATCH_SIZE: 100,
    BATCH_INTERVAL_MS: 5000,

    // Data retention (in days)
    RETENTION_DAYS_EVENTS: 90,
    RETENTION_DAYS_METRICS: 365,
    RETENTION_DAYS_REPORTS: 365,

    // Rate limits
    EVENTS_PER_MINUTE: 1000,
    EVENTS_PER_HOUR: 50000,

    // Session timeout (in milliseconds)
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes

    // Default metric periods
    DEFAULT_PERIOD: 'day' as const,

    // Provider specific
    GOOGLE_ANALYTICS_API_VERSION: 'v1beta',
    GOOGLE_ANALYTICS_BATCH_SIZE: 25,
    MIXPANEL_API_VERSION: '2.0',
    MIXPANEL_BATCH_SIZE: 50,
    PLAUSIBLE_API_VERSION: 'v1',
  },

  EVENT_NAMES: {
    // Page Events
    PAGE_VIEW: 'page_view',
    PAGE_EXIT: 'page_exit',

    // User Events
    USER_SIGNUP: 'user_signup',
    USER_LOGIN: 'user_login',
    USER_LOGOUT: 'user_logout',
    USER_UPDATED: 'user_updated',

    // Project Events
    PROJECT_CREATED: 'project_created',
    PROJECT_UPDATED: 'project_updated',
    PROJECT_DELETED: 'project_deleted',
    PROJECT_VIEWED: 'project_viewed',

    // Task Events
    TASK_CREATED: 'task_created',
    TASK_UPDATED: 'task_updated',
    TASK_COMPLETED: 'task_completed',
    TASK_DELETED: 'task_deleted',

    // AI Events
    AI_REQUEST: 'ai_request',
    AI_RESPONSE: 'ai_response',
    AI_ERROR: 'ai_error',

    // Payment Events
    SUBSCRIPTION_STARTED: 'subscription_started',
    SUBSCRIPTION_UPDATED: 'subscription_updated',
    SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
    PAYMENT_SUCCESS: 'payment_success',
    PAYMENT_FAILED: 'payment_failed',

    // Error Events
    ERROR_4XX: 'error_4xx',
    ERROR_5XX: 'error_5xx',
    ERROR_NETWORK: 'error_network',

    // Custom Events
    BUTTON_CLICKED: 'button_clicked',
    FORM_SUBMITTED: 'form_submitted',
    MODAL_OPENED: 'modal_opened',
    MODAL_CLOSED: 'modal_closed',
  },

  METRIC_DIMENSIONS: {
    // User dimensions
    USER_ID: 'user_id',
    USER_ROLE: 'user_role',
    USER_PLAN: 'user_plan',

    // Geographic dimensions
    COUNTRY: 'country',
    CITY: 'city',
    TIMEZONE: 'timezone',

    // Technical dimensions
    BROWSER: 'browser',
    OS: 'os',
    DEVICE_TYPE: 'device_type',
    SCREEN_RESOLUTION: 'screen_resolution',

    // Page dimensions
    PAGE_PATH: 'page_path',
    PAGE_TITLE: 'page_title',
    REFERRER: 'referrer',

    // Feature dimensions
    FEATURE: 'feature',
    ACTION: 'action',
    CATEGORY: 'category',

    // AI dimensions
    AI_MODEL: 'ai_model',
    AI_PROVIDER: 'ai_provider',
    AI_REQUEST_TYPE: 'ai_request_type',

    // Payment dimensions
    PAYMENT_METHOD: 'payment_method',
    SUBSCRIPTION_PLAN: 'subscription_plan',
    PAYMENT_STATUS: 'payment_status',
  },

  AGGREGATION_FUNCTIONS: {
    COUNT: 'count',
    SUM: 'sum',
    AVERAGE: 'avg',
    MIN: 'min',
    MAX: 'max',
    MEDIAN: 'median',
    PERCENTILE_95: 'p95',
    PERCENTILE_99: 'p99',
  },

  WIDGET_DEFAULTS: {
    LINE_CHART_WIDTH: 6,
    LINE_CHART_HEIGHT: 3,
    LINE_CHART_SHOW_LEGEND: true,
    LINE_CHART_SHOW_GRID: true,
    LINE_CHART_SMOOTH: true,

    BAR_CHART_WIDTH: 4,
    BAR_CHART_HEIGHT: 3,
    BAR_CHART_SHOW_LEGEND: true,
    BAR_CHART_HORIZONTAL: false,

    PIE_CHART_WIDTH: 3,
    PIE_CHART_HEIGHT: 3,
    PIE_CHART_SHOW_LEGEND: true,
    PIE_CHART_DONUT: false,

    METRIC_WIDTH: 2,
    METRIC_HEIGHT: 2,
    METRIC_SHOW_TREND: true,
    METRIC_SHOW_CHANGE: true,

    TABLE_WIDTH: 6,
    TABLE_HEIGHT: 4,
    TABLE_PAGE_SIZE: 10,
    TABLE_SORTABLE: true,
    TABLE_FILTERABLE: true,
  },

  DASHBOARD_TEMPLATES: {
    OVERVIEW: 'overview',
    AI_USAGE: 'ai_usage',
    PAYMENTS: 'payments',
    USER_BEHAVIOR: 'user_behavior',
    PERFORMANCE: 'performance',
    CUSTOM: 'custom',
  },

  REPORT_TEMPLATES: {
    USAGE_SUMMARY: 'usage_summary',
    COST_ANALYSIS: 'cost_analysis',
    USER_ACTIVITY: 'user_activity',
    PERFORMANCE: 'performance',
    CUSTOM: 'custom',
  },

  DATE_RANGE_PRESETS: {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    LAST_7_DAYS: 'last_7_days',
    LAST_30_DAYS: 'last_30_days',
    LAST_90_DAYS: 'last_90_days',
    THIS_MONTH: 'this_month',
    LAST_MONTH: 'last_month',
    THIS_YEAR: 'this_year',
    CUSTOM: 'custom',
  },

  COMMON_METRICS: {
    // User Metrics
    DAILY_ACTIVE_USERS: 'daily_active_users',
    WEEKLY_ACTIVE_USERS: 'weekly_active_users',
    MONTHLY_ACTIVE_USERS: 'monthly_active_users',
    NEW_USERS: 'new_users',
    RETURNING_USERS: 'returning_users',

    // Engagement Metrics
    PAGE_VIEWS: 'page_views',
    SESSIONS: 'sessions',
    AVG_SESSION_DURATION: 'avg_session_duration',
    BOUNCE_RATE: 'bounce_rate',

    // AI Metrics
    AI_REQUESTS: 'ai_requests',
    AI_COST: 'ai_cost',
    AI_LATENCY: 'ai_latency',
    AI_SUCCESS_RATE: 'ai_success_rate',

    // Payment Metrics
    REVENUE: 'revenue',
    MRR: 'mrr',
    CHURN_RATE: 'churn_rate',
    NEW_SUBSCRIPTIONS: 'new_subscriptions',
    CANCELLED_SUBSCRIPTIONS: 'cancelled_subscriptions',

    // Performance Metrics
    API_RESPONSE_TIME: 'api_response_time',
    ERROR_RATE: 'error_rate',
    UPTIME: 'uptime',
  },

  ERROR_MESSAGES: {
    EVENT_TRACKING_FAILED: 'Failed to track analytics event',
    METRIC_CALCULATION_FAILED: 'Failed to calculate metric',
    DASHBOARD_NOT_FOUND: 'Dashboard not found',
    REPORT_GENERATION_FAILED: 'Failed to generate report',
    PROVIDER_SYNC_FAILED: 'Failed to sync with analytics provider',
    INVALID_DATE_RANGE: 'Invalid date range specified',
    INVALID_METRIC_TYPE: 'Invalid metric type',
    RATE_LIMIT_EXCEEDED: 'Analytics rate limit exceeded',
    DASHBOARD_NAME_REQUIRED: 'Dashboard name is required',
    REPORT_NAME_REQUIRED: 'Report name is required',
    INVALID_WIDGET_CONFIG: 'Invalid widget configuration',
    INVALID_REPORT_QUERY: 'Invalid report query',
  },
} as const;

// Priority weights for metric importance
export const METRIC_IMPORTANCE_WEIGHTS = {
  [ANALYTICS_CONSTANTS.COMMON_METRICS.DAILY_ACTIVE_USERS]: 10,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.PAGE_VIEWS]: 8,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.SESSIONS]: 8,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.AI_REQUESTS]: 7,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.REVENUE]: 10,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.MRR]: 10,
  [ANALYTICS_CONSTANTS.COMMON_METRICS.CHURN_RATE]: 9,
} as const;
