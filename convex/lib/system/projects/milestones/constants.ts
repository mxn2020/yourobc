// convex/lib/system/milestones/constants.ts

export const MILESTONE_CONSTANTS = {
  STATUS: {
    UPCOMING: 'upcoming',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled',
  },
  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
    CRITICAL: 'critical',
  },
  PERMISSIONS: {
    VIEW: 'milestones.view',
    CREATE: 'milestones.create',
    EDIT: 'milestones.edit',
    DELETE: 'milestones.delete',
  },
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_DELIVERABLES: 50,
    MAX_DEPENDENCIES: 20,
  },
} as const;

export const MILESTONE_STATUS_COLORS = {
  [MILESTONE_CONSTANTS.STATUS.UPCOMING]: '#6b7280',
  [MILESTONE_CONSTANTS.STATUS.IN_PROGRESS]: '#3b82f6',
  [MILESTONE_CONSTANTS.STATUS.COMPLETED]: '#10b981',
  [MILESTONE_CONSTANTS.STATUS.DELAYED]: '#f59e0b',
  [MILESTONE_CONSTANTS.STATUS.CANCELLED]: '#ef4444',
} as const;

export const PRIORITY_WEIGHTS = {
  [MILESTONE_CONSTANTS.PRIORITY.LOW]: 1,
  [MILESTONE_CONSTANTS.PRIORITY.MEDIUM]: 2,
  [MILESTONE_CONSTANTS.PRIORITY.HIGH]: 3,
  [MILESTONE_CONSTANTS.PRIORITY.URGENT]: 4,
  [MILESTONE_CONSTANTS.PRIORITY.CRITICAL]: 5,
} as const;
