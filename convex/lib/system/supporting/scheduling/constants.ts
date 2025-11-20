// convex/lib/boilerplate/supporting/scheduling/constants.ts

/**
 * Scheduling Constants
 */
export const SCHEDULING_CONSTANTS = {
  // Processing retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 60000, // 1 minute

  // Time windows
  UPCOMING_WINDOW_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  RECENT_WINDOW_MS: 30 * 24 * 60 * 60 * 1000, // 30 days

  // Default values
  DEFAULT_EVENT_DURATION_MS: 60 * 60 * 1000, // 1 hour
  DEFAULT_BUFFER_TIME_MS: 15 * 60 * 1000, // 15 minutes

  // Status labels
  STATUS_LABELS: {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    cancelled: 'Cancelled',
    completed: 'Completed',
    no_show: 'No Show',
  } as const,

  // Processing status labels
  PROCESSING_STATUS_LABELS: {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  } as const,

  // Priority labels and colors
  PRIORITY: {
    low: {
      label: 'Low',
      color: '#10B981', // Green
      value: 1,
    },
    medium: {
      label: 'Medium',
      color: '#3B82F6', // Blue
      value: 2,
    },
    high: {
      label: 'High',
      color: '#F59E0B', // Amber
      value: 3,
    },
    urgent: {
      label: 'Urgent',
      color: '#EF4444', // Red
      value: 4,
    },
  } as const,

  // Event type icons (for UI)
  TYPE_ICONS: {
    meeting: 'Users',
    appointment: 'Calendar',
    event: 'CalendarDays',
    task: 'CheckSquare',
    reminder: 'Bell',
    block: 'Ban',
    other: 'Circle',
  } as const,

  // Visibility levels
  VISIBILITY: {
    public: {
      label: 'Public',
      description: 'Visible to everyone',
    },
    private: {
      label: 'Private',
      description: 'Only visible to organizer',
    },
    internal: {
      label: 'Internal',
      description: 'Visible to team members',
    },
  } as const,
} as const;
