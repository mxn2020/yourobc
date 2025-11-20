// utils/errorHandling.ts

export type ErrorType = 'auth' | 'permission' | 'network' | 'validation' | 'not_found' | 'unknown'

export interface ParsedError {
  message: string
  code?: string
  type?: ErrorType
  permission?: string
  module?: string
  action?: string
  details?: string | undefined
  shouldRedirectToLogin?: boolean
}

export interface ConvexError {
  message: string
  data?: {
    code?: string
    details?: any
  }
}

/**
 * Permission Mappings
 * Maps permission strings to user-friendly module names and actions
 *
 * ADD YOUR OWN PERMISSIONS HERE following this pattern:
 * 'module.resource.action': { module: 'Display Name', action: 'user-friendly action description' }
 */
const PERMISSION_MAP: Record<string, { module: string; action: string }> = {
  // Projects permissions
  'projects.view': { module: 'Projects', action: 'view projects' },
  'projects.create': { module: 'Projects', action: 'create projects' },
  'projects.update': { module: 'Projects', action: 'update projects' },
  'projects.delete': { module: 'Projects', action: 'delete projects' },

  // Audit Logs permissions
  'audit_logs.view': { module: 'Audit Logs', action: 'view audit logs' },
  'audit_logs.export': { module: 'Audit Logs', action: 'export audit logs' },

  // Tasks permissions
  'tasks.view': { module: 'Tasks', action: 'view tasks' },
  'tasks.create': { module: 'Tasks', action: 'create tasks' },
  'tasks.update': { module: 'Tasks', action: 'update tasks' },
  'tasks.delete': { module: 'Tasks', action: 'delete tasks' },

  // Comments permissions
  'comments.create': { module: 'Comments', action: 'create comments' },
  'comments.update': { module: 'Comments', action: 'update comments' },
  'comments.delete': { module: 'Comments', action: 'delete comments' },

  // Team permissions
  'team.view': { module: 'Team', action: 'view team members' },
  'team.invite': { module: 'Team', action: 'invite team members' },
  'team.manage': { module: 'Team', action: 'manage team members' },

  // User management permissions
  'users.view': { module: 'Users', action: 'view users' },
  'users.create': { module: 'Users', action: 'create users' },
  'users.update': { module: 'Users', action: 'update users' },
  'users.delete': { module: 'Users', action: 'delete users' },

  // Settings permissions
  'settings.view': { module: 'Settings', action: 'view settings' },
  'settings.update': { module: 'Settings', action: 'update settings' },

  // Add your own permissions here...
  // 'customers.view': { module: 'Customers', action: 'view customers' },
  // 'invoices.create': { module: 'Invoices', action: 'create invoices' },
}

/**
 * Check if an error is an authentication error that requires redirect to login
 */
export function isAuthenticationError(error: any): boolean {
  const message = error?.message || ''

  return (
    message.includes('Not authenticated') ||
    message.includes('user profile not found') ||
    message.includes('Session expired') ||
    message.includes('Invalid session') ||
    message.includes('No active session') ||
    message.includes('Authentication required')
  )
}

/**
 * Extract structured error metadata from backend error message
 * Backend errors now follow format: [ERROR_CODE] Message | {"code":"ERROR_CODE", ...metadata}
 * May include Convex suffixes like "Called by client"
 */
function extractErrorMetadata(message: string): { code?: string; metadata?: any; cleanMessage: string } {
  // Try to extract error code and metadata from new structured format
  // Convex wraps errors with prefix like: "[CONVEX M(...)] [Request ID: ...] Server Error\nUncaught Error: [ERROR_CODE] ..."
  // So we need to find the pattern ANYWHERE in the message, not just at the start
  // Pattern: [ERROR_CODE] Message | {"json metadata"}
  const structuredMatch = message.match(/\[([A-Z_]+)\]\s+(.+?)\s*\|\s*(\{[^}]+\})/)

  if (structuredMatch) {
    try {
      const [, code, cleanMessage, metadataJson] = structuredMatch
      const metadata = JSON.parse(metadataJson)
      return { code, metadata, cleanMessage }
    } catch (e) {
      // JSON parsing failed, log and continue
      console.error('Failed to parse error metadata:', e)
    }
  }

  // Clean up Convex-specific formatting from raw message
  const cleanMessage = message
    .replace(/\[CONVEX [MQ]\([^\]]+\)\]\s*/g, '')
    .replace(/\[Request ID: [^\]]+\]\s*/g, '')
    .replace(/Server Error\s*/g, '')
    .replace(/Uncaught Error:\s*/g, '')
    .replace(/Called by (?:client|mutation|action)\s*/g, '')
    .replace(/\|\s*\{[^}]+\}.*$/g, '') // Remove JSON metadata and everything after
    .replace(/at .+/g, '')
    .trim()

  return { cleanMessage }
}

/**
 * Handle ArgumentValidationError from Convex
 * Example: "Object is missing the required field `projectId`. Consider wrapping..."
 */
function isArgumentValidationError(message: string): boolean {
  return (
    message.includes('Object is missing the required field') ||
    message.includes('ArgumentValidationError') ||
    message.includes('Validator') ||
    message.includes('Consider wrapping the field validator')
  )
}

export function parseConvexError(error: any): ParsedError {
  // Handle Convex-specific error format
  if (error?.message) {
    const message = error.message

    // Extract structured error data
    const { code, metadata, cleanMessage } = extractErrorMetadata(message)

    // Check for ArgumentValidationError (missing required fields)
    if (isArgumentValidationError(message)) {
      // Try to extract field name
      const fieldMatch = message.match(/field `(\w+)`/)
      const fieldName = fieldMatch ? fieldMatch[1] : 'required field'

      return {
        message: `Missing required information: ${fieldName}`,
        code: 'VALIDATION_ERROR',
        type: 'validation',
        details: `The field "${fieldName}" is required but was not provided.`,
        action: 'Please ensure all required fields are filled out before submitting.',
      }
    }

    // Handle structured error codes from backend
    if (code) {
      switch (code) {
        case 'AUTH_REQUIRED':
          return {
            message: metadata?.message || 'Your session has expired. Please sign in again.',
            code: 'AUTH_REQUIRED',
            type: 'auth',
            shouldRedirectToLogin: true,
            action: 'Redirecting to login page...',
          }

        case 'PERMISSION_DENIED':
          const permission = metadata?.permission

          if (permission && PERMISSION_MAP[permission]) {
            const { module, action } = PERMISSION_MAP[permission]
            return {
              message: `You don't have permission to ${action}.`,
              code: 'PERMISSION_DENIED',
              type: 'permission',
              permission,
              module,
              action: `Contact your administrator to request access to ${module}.`,
            }
          }
          // Extract module from permission string (e.g., 'projects.create' -> 'Projects')
          const moduleFromPermission = permission
            ? permission.split('.')[0].charAt(0).toUpperCase() + permission.split('.')[0].slice(1)
            : 'Unknown Module'
          return {
            message: cleanMessage || 'Permission denied',
            code: 'PERMISSION_DENIED',
            type: 'permission',
            permission,
            module: moduleFromPermission,
            action: 'Contact your administrator to request the required permissions.',
          }

        case 'ADMIN_REQUIRED':
          return {
            message: cleanMessage || 'Admin access required',
            code: 'ADMIN_REQUIRED',
            type: 'permission',
            action: 'This action requires administrator privileges. Contact your system administrator.',
          }

        case 'ACCESS_DENIED':
          return {
            message: cleanMessage || 'Access denied',
            code: 'ACCESS_DENIED',
            type: 'permission',
            action: 'You do not have permission to access this resource.',
          }

        case 'NOT_FOUND':
          return {
            message: cleanMessage || 'Resource not found',
            code: 'NOT_FOUND',
            type: 'not_found',
            details: metadata?.entityName ? `${metadata.entityName} not found` : undefined,
            action: 'The item may have been deleted or you may not have access to it.',
          }

        case 'ALREADY_EXISTS':
          return {
            message: cleanMessage || 'This item already exists',
            code: 'ALREADY_EXISTS',
            type: 'validation',
            details: metadata?.identifier ? `A ${metadata.entityName} with this ${metadata.identifier} already exists` : undefined,
            action: 'Please use a different name or identifier.',
          }

        case 'VALIDATION_FAILED':
          return {
            message: 'Please check your input and try again.',
            code: 'VALIDATION_ERROR',
            type: 'validation',
            details: metadata?.errors ? metadata.errors.join(', ') : cleanMessage,
            action: 'Review the form fields and ensure all required information is provided correctly.',
          }

        case 'QUOTA_EXCEEDED':
          return {
            message: cleanMessage || 'Quota exceeded',
            code: 'QUOTA_EXCEEDED',
            type: 'validation',
            details: metadata?.limit ? `Limit: ${metadata.limit}` : undefined,
            action: 'You have reached the maximum allowed limit for this resource.',
          }

        case 'OPERATION_NOT_ALLOWED':
          return {
            message: cleanMessage || 'Operation not allowed',
            code: 'OPERATION_NOT_ALLOWED',
            type: 'validation',
            details: metadata?.reason,
            action: 'This operation cannot be performed in the current state.',
          }
      }
    }

    if (message.includes('Validation failed')) {
      return {
        message: 'Please check your input and try again.',
        code: 'VALIDATION_ERROR',
        type: 'validation',
        details: cleanMessage,
        action: 'Review the form fields and ensure all required information is provided correctly.',
      }
    }

    if (message.includes('not found') || message.includes('Not found')) {
      return {
        message: 'The requested resource was not found.',
        code: 'NOT_FOUND',
        type: 'not_found',
        action: 'The item may have been deleted or you may not have access to it.',
      }
    }

    if (message.includes('Rate limit')) {
      return {
        message: 'Too many requests. Please wait a moment and try again.',
        code: 'RATE_LIMIT',
        type: 'validation',
      }
    }

    // Generic error - use cleaned message
    return {
      message: cleanMessage || 'An unexpected error occurred. Please try again.',
      code: 'UNKNOWN_ERROR',
      type: 'unknown',
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      type: 'network',
      action: 'Verify your internet connection and try again. If the problem persists, the service may be temporarily unavailable.',
    }
  }

  // Fallback for any other error types
  return {
    message: error?.message || 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    type: 'unknown',
  }
}
