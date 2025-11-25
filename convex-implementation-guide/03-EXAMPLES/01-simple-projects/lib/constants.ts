// convex/lib/software/freelancer_dashboard/projects/constants.ts
// Business constants for projects module

export const PROJECTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'projects:view',
    CREATE: 'projects:create',
    EDIT: 'projects:edit',
    DELETE: 'projects:delete',
    ARCHIVE: 'projects:archive',
    MANAGE_MEMBERS: 'projects:manage_members',
    BULK_EDIT: 'projects:bulk_edit',
  },

  STATUS: {
    PLANNING: 'planning',
    ACTIVE: 'active',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
  },

  PRIORITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent',
  },

  VISIBILITY: {
    PRIVATE: 'private',
    TEAM: 'team',
    PUBLIC: 'public',
  },

  MEMBER_ROLE: {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
    VIEWER: 'viewer',
  },

  MEMBER_STATUS: {
    ACTIVE: 'active',
    INVITED: 'invited',
    INACTIVE: 'inactive',
  },

  LIMITS: {
    MIN_NAME_LENGTH: 3,
    MAX_NAME_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_TAGS: 15,
    MIN_BUDGET: 0,
    MAX_BUDGET: 10000000,
    MAX_MEMBERS_PER_PROJECT: 50,
  },
} as const;

export const PROJECTS_VALUES = {
  status: Object.values(PROJECTS_CONSTANTS.STATUS),
  priority: Object.values(PROJECTS_CONSTANTS.PRIORITY),
  visibility: Object.values(PROJECTS_CONSTANTS.VISIBILITY),
  memberRole: Object.values(PROJECTS_CONSTANTS.MEMBER_ROLE),
  memberStatus: Object.values(PROJECTS_CONSTANTS.MEMBER_STATUS),
} as const;
