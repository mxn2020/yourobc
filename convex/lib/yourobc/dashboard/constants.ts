// convex/lib/yourobc/dashboard/constants.ts
// convex/yourobc/dashboard/constants.ts
export const DASHBOARD_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'dashboard.view',
    VIEW_STATS: 'dashboard.view_stats',
    VIEW_ACTIVITY: 'dashboard.view_activity',
    VIEW_TASKS: 'dashboard.view_tasks',
    VIEW_TRENDS: 'dashboard.view_trends',
  },
  DEFAULT_VALUES: {
    TREND_MONTHS: 6,
    ACTIVITY_LIMIT: 20,
    TASKS_DAYS: 7,
    TASKS_LIMIT: 20,
  },
} as const;
