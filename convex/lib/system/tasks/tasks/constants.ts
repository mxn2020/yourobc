// convex/lib/boilerplate/tasks/tasks/constants.ts
// Business constants, permissions, and limits for tasks module

export const TASKS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'tasks:view',
    CREATE: 'tasks:create',
    EDIT: 'tasks:edit',
    DELETE: 'tasks:delete',
    ASSIGN: 'tasks:assign',
    BULK_EDIT: 'tasks:bulk_edit',
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
    MIN_TITLE_LENGTH: 3,
    MAX_TAGS: 20,
    MIN_ESTIMATED_HOURS: 0,
    MAX_ESTIMATED_HOURS: 1000,
  },

  VALIDATION: {
    TITLE_PATTERN: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },

  STATUS_COLORS: {
    TODO: '#6b7280',
    IN_PROGRESS: '#3b82f6',
    IN_REVIEW: '#f59e0b',
    COMPLETED: '#10b981',
    BLOCKED: '#ef4444',
    CANCELLED: '#9ca3af',
  },

  PRIORITY_WEIGHTS: {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    URGENT: 4,
    CRITICAL: 5,
  },
} as const;
