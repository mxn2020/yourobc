// convex/lib/system/user_profiles/user_profiles/constants.ts
// Business constants, permissions, and limits for user_profiles module

export const USER_PROFILES_CONSTANTS = {
  PERMISSIONS: {
    ADMIN_ACCESS: 'admin.access',
    USER_MANAGEMENT: 'users.manage',
    PROFILE_EDIT: 'profile.edit',
    ROLE_ASSIGN: 'roles.assign',
    AUDIT_VIEW: 'audit.view',
  },

  ROLES: {
    SUPERADMIN: 'superadmin',
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator',
    EDITOR: 'editor',
    ANALYST: 'analyst',
    GUEST: 'guest',
  },

  ACTIVITY_TYPES: {
    LOGIN: 'login',
    AI_REQUEST: 'ai_request',
    PROJECT_CREATED: 'project_created',
    TASK_COMPLETED: 'task_completed',
  },

  LIMITS: {
    MAX_NAME_LENGTH: 100,
    MIN_NAME_LENGTH: 1,
    MAX_BIO_LENGTH: 500,
    MAX_PERMISSIONS: 50,
    MAX_BADGES: 20,
    MAX_METADATA_NOTES_LENGTH: 1000,
    MAX_METADATA_TAGS: 10,
    MAX_CUSTOM_FIELDS: 20,
  },

  KARMA_REWARDS: {
    TASK_COMPLETED: 10,
    PROJECT_CREATED: 25,
    PROFILE_COMPLETED: 50,
    ACHIEVEMENT_UNLOCKED: 100,
  },

  METADATA_SOURCES: {
    MANUAL: 'manual',
    AUTH_SYNC: 'auth_sync',
    MIGRATION: 'migration',
    RECOVERY: 'recovery',
    BATCH_IMPORT: 'batch_import',
  },

  METADATA_TAGS: {
    RECOVERED: 'recovered',
    MIGRATED: 'migrated',
    VERIFIED: 'verified',
    PREMIUM: 'premium',
    BETA_USER: 'beta_user',
  },

  VALIDATION: {
    NAME_PATTERN: /^[a-zA-Z0-9\s\-_'.]+$/,
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
} as const;
