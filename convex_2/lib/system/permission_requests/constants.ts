// convex/lib/system/permission_requests/constants.ts

/**
 * Permission Request Constants and Configuration Values
 */

/**
 * Permissions for permission request operations
 */
export const PERMISSIONS = {
  PERMISSION_REQUEST_VIEW: 'permission_requests:view',
  PERMISSION_REQUEST_CREATE: 'permission_requests:create',
  PERMISSION_REQUEST_APPROVE: 'permission_requests:approve',
  PERMISSION_REQUEST_DENY: 'permission_requests:deny',
  PERMISSION_REQUEST_CANCEL: 'permission_requests:cancel',
} as const;

/**
 * Permission request statuses
 */
export const STATUSES = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  CANCELLED: 'cancelled',
} as const;

/**
 * Field Length Limits
 */
export const LIMITS = {
  PERMISSION_MAX: 200,
  MODULE_MAX: 200,
  MESSAGE_MAX: 1000,
  REVIEW_NOTES_MAX: 2000,
} as const;

/**
 * Default Values
 */
export const DEFAULTS = {
  STATUS: STATUSES.PENDING,
} as const;

/**
 * Audit Actions
 */
export const ACTIONS = {
  PERMISSION_REQUEST_CREATED: 'permission_request.created',
  PERMISSION_REQUEST_APPROVED: 'permission_request.approved',
  PERMISSION_REQUEST_DENIED: 'permission_request.denied',
  PERMISSION_REQUEST_CANCELLED: 'permission_request.cancelled',
} as const;

/**
 * Entity Types
 */
export const ENTITY_TYPES = {
  SYSTEM_PERMISSION_REQUEST: 'system_permission_request',
} as const;

/**
 * Error Messages
 */
export const ERROR_MESSAGES = {
  REQUEST_NOT_FOUND: 'Permission request not found',
  ALREADY_HAS_PENDING_REQUEST: 'You already have a pending request for this permission',
  CANNOT_APPROVE_NON_PENDING: 'Cannot approve request with non-pending status',
  CANNOT_DENY_NON_PENDING: 'Cannot deny request with non-pending status',
  CANNOT_CANCEL_NON_PENDING: 'Cannot cancel request with non-pending status',
  NOT_AUTHORIZED: 'You are not authorized to perform this action',
  ONLY_OWN_REQUEST: 'You can only cancel your own permission requests',
} as const;
