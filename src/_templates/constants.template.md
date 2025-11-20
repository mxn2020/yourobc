// src/features/boilerplate/[module_name]/constants/index.ts

/**
 * [Module] Constants
 * Centralized constants for the [module_name] feature
 */
export const [MODULE]_CONSTANTS = {
  // ==========================================
  // PERMISSIONS
  // ==========================================
  PERMISSIONS: {
    VIEW: "[module_name]:view",
    CREATE: "[module_name]:create",
    EDIT: "[module_name]:edit",
    DELETE: "[module_name]:delete",
    ARCHIVE: "[module_name]:archive",
    RESTORE: "[module_name]:restore",
    MANAGE_TEAM: "[module_name]:manage_team",
    PUBLISH: "[module_name]:publish",
  } as const,

  // ==========================================
  // STATUS
  // ==========================================
  STATUS: {
    ACTIVE: "active",
    COMPLETED: "completed",
    ON_HOLD: "on-hold",
    ARCHIVED: "archived",
    DRAFT: "draft",
    CANCELLED: "cancelled",
  } as const,

  // ==========================================
  // PRIORITY
  // ==========================================
  PRIORITY: {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
  } as const,

  // ==========================================
  // VISIBILITY
  // ==========================================
  VISIBILITY: {
    PRIVATE: "private", // Only owner and explicitly added members
    TEAM: "team",       // All team members
    PUBLIC: "public",   // Anyone with link
  } as const,

  // ==========================================
  // VALIDATION LIMITS
  // ==========================================
  LIMITS: {
    MAX_TITLE_LENGTH: 200,
    MIN_TITLE_LENGTH: 1,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_CATEGORY_LENGTH: 100,
    MAX_TAGS: 20,
    MAX_TAG_LENGTH: 50,
    MAX_MEMBERS: 100,
    MAX_ATTACHMENTS: 50,
    MAX_COMMENTS: 1000,
  } as const,

  // ==========================================
  // DEFAULTS
  // ==========================================
  DEFAULTS: {
    STATUS: "active",
    PRIORITY: "medium",
    VISIBILITY: "private",
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    SORT_BY: "createdAt",
    SORT_ORDER: "desc",
    STALE_TIME: 30000, // 30 seconds
  } as const,

  // ==========================================
  // DATE RANGES
  // ==========================================
  DATE_RANGES: {
    OVERDUE_THRESHOLD: 0, // Days (negative means past due)
    DUE_SOON_THRESHOLD: 7, // Days
    AT_RISK_THRESHOLD: 14, // Days
  } as const,

  // ==========================================
  // HEALTH THRESHOLDS
  // ==========================================
  HEALTH: {
    EXCELLENT: "excellent", // > 80% on track
    GOOD: "good",           // 60-80% on track
    AT_RISK: "at-risk",     // 40-60% on track
    CRITICAL: "critical",   // < 40% on track
  } as const,

  // ==========================================
  // MEMBER ROLES
  // ==========================================
  MEMBER_ROLES: {
    OWNER: "owner",     // Full control
    ADMIN: "admin",     // Can manage members and settings
    MEMBER: "member",   // Can edit
    VIEWER: "viewer",   // Read-only access
  } as const,

  // ==========================================
  // SORT OPTIONS
  // ==========================================
  SORT_OPTIONS: {
    TITLE: "title",
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
    DUE_DATE: "dueDate",
    PRIORITY: "priority",
    STATUS: "status",
    PROGRESS: "progress",
  } as const,

  // ==========================================
  // FILTER PRESETS
  // ==========================================
  FILTER_PRESETS: {
    ALL: "all",
    MY_[ENTITIES]: "my-[entities]",
    ACTIVE: "active",
    COMPLETED: "completed",
    OVERDUE: "overdue",
    DUE_SOON: "due-soon",
    ARCHIVED: "archived",
  } as const,

  // ==========================================
  // VIEW MODES
  // ==========================================
  VIEW_MODES: {
    GRID: "grid",
    TABLE: "table",
    KANBAN: "kanban",
    CALENDAR: "calendar",
  } as const,

  // ==========================================
  // AUDIT ACTION TYPES
  // ==========================================
  AUDIT_ACTIONS: {
    CREATED: "[module_name].{entity}.created",
    UPDATED: "[module_name].{entity}.updated",
    DELETED: "[module_name].{entity}.deleted",
    ARCHIVED: "[module_name].{entity}.archived",
    RESTORED: "[module_name].{entity}.restored",
    VIEWED: "[module_name].{entity}.viewed",
    PUBLISHED: "[module_name].{entity}.published",
    UNPUBLISHED: "[module_name].{entity}.unpublished",
    MEMBER_ADDED: "[module_name].{entity}.member_added",
    MEMBER_REMOVED: "[module_name].{entity}.member_removed",
    MEMBER_ROLE_CHANGED: "[module_name].{entity}.member_role_changed",
  } as const,

  // ==========================================
  // ERROR CODES
  // ==========================================
  ERROR_CODES: {
    NOT_FOUND: "[MODULE]_NOT_FOUND",
    PERMISSION_DENIED: "[MODULE]_PERMISSION_DENIED",
    VALIDATION_FAILED: "[MODULE]_VALIDATION_FAILED",
    ALREADY_EXISTS: "[MODULE]_ALREADY_EXISTS",
    LIMIT_EXCEEDED: "[MODULE]_LIMIT_EXCEEDED",
    INVALID_STATUS: "[MODULE]_INVALID_STATUS",
  } as const,
} as const;

// ==========================================
// TYPE EXPORTS
// ==========================================

export type [Entity]Status = typeof [MODULE]_CONSTANTS.STATUS[keyof typeof [MODULE]_CONSTANTS.STATUS];
export type [Entity]Priority = typeof [MODULE]_CONSTANTS.PRIORITY[keyof typeof [MODULE]_CONSTANTS.PRIORITY];
export type [Entity]Visibility = typeof [MODULE]_CONSTANTS.VISIBILITY[keyof typeof [MODULE]_CONSTANTS.VISIBILITY];
export type [Entity]MemberRole = typeof [MODULE]_CONSTANTS.MEMBER_ROLES[keyof typeof [MODULE]_CONSTANTS.MEMBER_ROLES];
export type [Entity]Health = typeof [MODULE]_CONSTANTS.HEALTH[keyof typeof [MODULE]_CONSTANTS.HEALTH];
export type [Entity]SortOption = typeof [MODULE]_CONSTANTS.SORT_OPTIONS[keyof typeof [MODULE]_CONSTANTS.SORT_OPTIONS];
export type [Entity]ViewMode = typeof [MODULE]_CONSTANTS.VIEW_MODES[keyof typeof [MODULE]_CONSTANTS.VIEW_MODES];
