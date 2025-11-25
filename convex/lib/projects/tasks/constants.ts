// convex/lib/projects/tasks/constants.ts
// Business constants and limits for project tasks

export const TASK_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'projects.tasks:view',
    CREATE: 'projects.tasks:create',
    EDIT: 'projects.tasks:edit',
    DELETE: 'projects.tasks:delete',
  },

  STATUS: {
    TODO: 'todo',
    IN_PROGRESS: 'in_progress',
    IN_REVIEW: 'in_review',
    COMPLETED: 'completed',
    BLOCKED: 'blocked',
    CANCELLED: 'cancelled',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAGS: 20,
  },
} as const;

// Helper arrays for validation/iteration
export const TASK_VALUES = {
  status: Object.values(TASK_CONSTANTS.STATUS),
  priority: Object.values(TASK_CONSTANTS.PRIORITY),
} as const;
