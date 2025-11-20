// src/features/audit-logs/types/audit-logs.constants.ts
import { AuditLogServiceConfig } from "./audit-logs.types"

// === Constants ===
export const AUDIT_LOG_CONSTANTS = {
  // Retention periods (in days)
  RETENTION_PERIODS: {
    SECURITY_LOGS: 365,
    USER_ACTIONS: 180,
    SYSTEM_ACTIONS: 90,
    PROJECT_ACTIONS: 365,
    DEFAULT: 365,
  },

  // Severity levels
  SEVERITY: {
    INFO: 'info' as const,
    WARNING: 'warning' as const,
    ERROR: 'error' as const,
    CRITICAL: 'critical' as const,
  },

  // Common actions
  ACTIONS: {
    USER: {
      CREATED: 'user.created',
      UPDATED: 'user.updated',
      DELETED: 'user.deleted',
      ROLE_CHANGED: 'user.role_changed',
      BANNED: 'user.banned',
      LOGIN: 'user.login',
      LOGOUT: 'user.logout',
    },
    PROJECT: {
      CREATED: 'project.created',
      UPDATED: 'project.updated',
      DELETED: 'project.deleted',
      SHARED: 'project.shared',
    },
    SYSTEM: {
      SETTINGS_UPDATED: 'settings.updated',
      MAINTENANCE: 'system.maintenance',
      BACKUP: 'system.backup',
    },
    SECURITY: {
      LOGIN_FAILED: 'security.login_failed',
      ACCOUNT_LOCKED: 'security.account_locked',
      PERMISSION_DENIED: 'security.permission_denied',
    }
  },

  // Entity types
  ENTITY_TYPES: {
    USER: 'user',
    USER_PROFILE: 'userProfile',
    PROJECT: 'project',
    SETTINGS: 'settings',
    SYSTEM: 'system',
  },

  // Export formats
  EXPORT_FORMATS: {
    CSV: 'csv',
    JSON: 'json',
    PDF: 'pdf',
  },

  // Query limits
  LIMITS: {
    DEFAULT_PAGE_SIZE: 50,
    MAX_PAGE_SIZE: 1000,
    MAX_EXPORT_SIZE: 10000,
    SEARCH_MIN_LENGTH: 3,
  }
} as const

// === Default Configurations ===
export const DEFAULT_AUDIT_LOG_CONFIG: AuditLogServiceConfig = {
  retentionDays: 365,
  maxLogsPerQuery: 1000,
  enableRealTimeUpdates: false,
  autoCapture: {
    userActions: true,
    systemActions: true,
    apiRequests: false,
  }
}

// === Permission Constants ===
export const AUDIT_LOG_PERMISSIONS = {
  VIEW: 'audit.view',
  EXPORT: 'audit.export',
  DELETE: 'audit.delete',
  MANAGE: 'audit.manage',
} as const