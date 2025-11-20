// convex/lib/boilerplate/system_metrics/constants.ts
// Constants for systemMetrics module

export const SYSTEM_METRICS_CONSTANTS = {
  METRIC_TYPES: {
    API_RESPONSE: 'api_response',
    DATABASE: 'database',
    CPU: 'cpu',
    MEMORY: 'memory',
    ERROR_RATE: 'error_rate',
    UPTIME: 'uptime',
  },
  UNITS: {
    MILLISECONDS: 'ms',
    PERCENT: 'percent',
    COUNT: 'count',
    BYTES: 'bytes',
    BOOLEAN: 'boolean',
  },
  PERMISSIONS: {
    VIEW: 'system_metrics.view',
    CREATE: 'system_metrics.create',
    DELETE: 'system_metrics.delete',
  },
  LIMITS: {
    RETENTION_DAYS: 90,
    MAX_METRICS_PER_QUERY: 10000,
  },
} as const;
