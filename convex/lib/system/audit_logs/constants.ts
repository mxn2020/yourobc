// convex/lib/system/audit_logs/constants.ts
// convex/auditLogs/constants.ts

export const AUDIT_LOG_CONSTANTS = {
  ENTITY_TYPES: {
    USER: 'user',
    PROJECT: 'project',
    SETTINGS: 'settings',
    SYSTEM: 'system',
  },
  ACTIONS: {
    // User actions
    USER_CREATED: 'user.created',
    USER_UPDATED: 'user.updated',
    USER_DELETED: 'user.deleted',
    USER_ACTIVATED: 'user.activated',
    USER_DEACTIVATED: 'user.deactivated',
    ROLE_CHANGED: 'user.role_changed',
    PROFILE_CREATED: 'user.profile_created',
    PROFILE_UPDATED: 'user.profile_updated',
    
    // Project actions
    PROJECT_CREATED: 'project.created',
    PROJECT_UPDATED: 'project.updated',
    PROJECT_DELETED: 'project.deleted',
    PROJECT_SHARED: 'project.shared',
    
    // System actions
    SETTINGS_UPDATED: 'settings.updated',
    SYSTEM_MAINTENANCE: 'system.maintenance',
  },
  LIMITS: {
    MAX_DESCRIPTION_LENGTH: 1000,
    RETENTION_DAYS: 365,
    MAX_LOGS_PER_QUERY: 1000,
  },
} as const;

