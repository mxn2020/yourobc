// convex/lib/system/core/permission_requests/constants.ts
// Business constants, permissions, and limits for permission_requests module

export const PERMISSION_REQUESTS_CONSTANTS = {
  PERMISSIONS: {
    VIEW: 'permission_requests:view',
    CREATE: 'permission_requests:create',
    APPROVE: 'permission_requests:approve',
    DENY: 'permission_requests:deny',
    CANCEL: 'permission_requests:cancel',
  },

  STATUSES: {
    PENDING: 'pending',
    APPROVED: 'approved',
    DENIED: 'denied',
    CANCELLED: 'cancelled',
  },

  LIMITS: {
    MAX_PERMISSION_LENGTH: 200,
    MAX_MODULE_LENGTH: 200,
    MAX_MESSAGE_LENGTH: 1000,
    MAX_REVIEW_NOTES_LENGTH: 2000,
  },

  DEFAULTS: {
    STATUS: 'pending' as const,
  },

  ACTIONS: {
    REQUEST_CREATED: 'permission_request.created',
    REQUEST_APPROVED: 'permission_request.approved',
    REQUEST_DENIED: 'permission_request.denied',
    REQUEST_CANCELLED: 'permission_request.cancelled',
  },

  ENTITY_TYPES: {
    SYSTEM_PERMISSION_REQUEST: 'system_permission_request',
  },

  ERROR_MESSAGES: {
    REQUEST_NOT_FOUND: 'Permission request not found',
    ALREADY_HAS_PENDING_REQUEST: 'You already have a pending request for this permission',
    CANNOT_APPROVE_NON_PENDING: 'Cannot approve request with non-pending status',
    CANNOT_DENY_NON_PENDING: 'Cannot deny request with non-pending status',
    CANNOT_CANCEL_NON_PENDING: 'Cannot cancel request with non-pending status',
    NOT_AUTHORIZED: 'You are not authorized to perform this action',
    ONLY_OWN_REQUEST: 'You can only cancel your own permission requests',
  },
} as const;
