// convex/lib/yourobc/tasks/constants.ts
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
    DRAFT: 'draft',
    ACTIVE: 'active',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    ARCHIVED: 'archived',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical',
  },

  TASK_TYPE: {
    GENERAL: 'general',
    SHIPMENT: 'shipment',
    QUOTE: 'quote',
    CUSTOMER: 'customer',
    PARTNER: 'partner',
    FOLLOWUP: 'followup',
  },

  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MIN_TITLE_LENGTH: 3,
    MAX_TAGS: 10,
    MAX_CHECKLIST_ITEMS: 50,
    MAX_COMPLETION_NOTES_LENGTH: 1000,
  },

  VALIDATION: {
    TITLE_PATTERN: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
  },
} as const;

export const TASKS_VALUES = {
  status: Object.values(TASKS_CONSTANTS.STATUS),
  priority: Object.values(TASKS_CONSTANTS.PRIORITY),
  taskType: Object.values(TASKS_CONSTANTS.TASK_TYPE),
} as const;
