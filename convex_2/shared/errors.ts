// convex/lib/shared/errors.ts
// ============================================================================
// Global Error Handling Utilities
// ============================================================================
// This file provides standardized error throwing functions used across all
// mutation files to ensure consistent error handling and messaging.
//
// All errors now include standardized error codes for better frontend parsing
// and handling. Error format: [ERROR_CODE] Message | metadata as JSON

/**
 * Standard error codes used throughout the application
 * These codes help the frontend parse and handle errors appropriately
 */
export const ErrorCodes = {
  // Authentication & Authorization
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  ADMIN_REQUIRED: 'ADMIN_REQUIRED',
  ACCESS_DENIED: 'ACCESS_DENIED',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  INVALID_STATUS: 'INVALID_STATUS',

  // Operation errors
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  UNAUTHORIZED_OPERATION: 'UNAUTHORIZED_OPERATION',

  // Resource constraints
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INSUFFICIENT_RESOURCES: 'INSUFFICIENT_RESOURCES',

  // Relationship errors
  HAS_DEPENDENCIES: 'HAS_DEPENDENCIES',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

  // Expiration
  EXPIRED: 'EXPIRED',
} as const

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes]

/**
 * Error metadata interface for structured error information
 */
export interface ErrorMetadata {
  code: ErrorCode
  entityName?: string
  identifier?: string
  permission?: string
  status?: string
  action?: string
  quotaName?: string
  limit?: string | number
  errors?: string[]
  [key: string]: any
}

/**
 * Format an error with code and metadata for consistent parsing
 */
function formatError(code: ErrorCode, message: string, metadata?: Partial<ErrorMetadata>): string {
  const meta = { code, ...metadata }
  return `[${code}] ${message} | ${JSON.stringify(meta)}`
}

/**
 * Throw a not found error
 * @param entityName - The name of the entity that was not found
 * @example throwNotFoundError('Student') // '[NOT_FOUND] Student not found | {...}'
 */
export function throwNotFoundError(entityName: string): never {
  const message = `${entityName} not found`
  throw new Error(formatError(ErrorCodes.NOT_FOUND, message, { entityName }))
}

/**
 * Throw an access denied error
 * @param message - Optional custom message
 * @param metadata - Optional additional metadata
 * @example throwAccessError('You do not have permission to edit this resource')
 * @example throwAccessError('Cannot view project', { permission: 'projects.view', module: 'Projects' })
 */
export function throwAccessError(
  message?: string,
  metadata?: Partial<Omit<ErrorMetadata, 'code'>>
): never {
  const msg = message || 'Access denied'
  throw new Error(formatError(ErrorCodes.ACCESS_DENIED, msg, metadata || {}))
}

/**
 * Throw a validation error
 * @param errors - Array of validation error messages
 * @example throwValidationError(['Email is required', 'Phone number is invalid'])
 */
export function throwValidationError(errors: string[]): never {
  const message = `Validation failed: ${errors.join(', ')}`
  throw new Error(formatError(ErrorCodes.VALIDATION_FAILED, message, { errors }))
}

/**
 * Throw an already exists error
 * @param entityName - The name of the entity that already exists
 * @param identifier - Optional identifier for what already exists
 * @example throwAlreadyExistsError('User', 'email') // '[ALREADY_EXISTS] User with this email already exists | {...}'
 */
export function throwAlreadyExistsError(entityName: string, identifier?: string): never {
  const identifierText = identifier ? ` with this ${identifier}` : ''
  const message = `${entityName}${identifierText} already exists`
  throw new Error(formatError(ErrorCodes.ALREADY_EXISTS, message, { entityName, identifier }))
}

/**
 * Throw an invalid status error
 * @param currentStatus - The current status
 * @param action - The action being attempted
 * @example throwInvalidStatusError('completed', 'delete')
 */
export function throwInvalidStatusError(currentStatus: string, action: string): never {
  const message = `Cannot ${action} entity with status: ${currentStatus}`
  throw new Error(formatError(ErrorCodes.INVALID_STATUS, message, { status: currentStatus, action }))
}

/**
 * Throw an insufficient resources error
 * @param message - Optional custom message
 * @example throwInsufficientResourcesError('Not enough credits')
 */
export function throwInsufficientResourcesError(message?: string): never {
  const msg = message || 'Insufficient resources'
  throw new Error(formatError(ErrorCodes.INSUFFICIENT_RESOURCES, msg, {}))
}

/**
 * Throw a relationship error (when trying to delete entities with dependencies)
 * @param entityName - The entity being deleted
 * @param dependentEntityName - The dependent entity preventing deletion
 * @example throwRelationshipError('Course', 'active enrollments')
 */
export function throwRelationshipError(entityName: string, dependentEntityName: string): never {
  const message = `Cannot delete ${entityName} with ${dependentEntityName}`
  throw new Error(formatError(ErrorCodes.HAS_DEPENDENCIES, message, { entityName, dependentEntityName }))
}

/**
 * Throw a duplicate error (when trying to create duplicate entries)
 * @param message - The error message
 * @example throwDuplicateError('Attendance already marked for this student')
 */
export function throwDuplicateError(message: string): never {
  throw new Error(formatError(ErrorCodes.DUPLICATE_ENTRY, message, {}))
}

/**
 * Throw an invalid parameter error
 * @param parameterName - The name of the invalid parameter
 * @param reason - Optional reason why it's invalid
 * @example throwInvalidParameterError('level', 'must be between 1 and 100')
 */
export function throwInvalidParameterError(parameterName: string, reason?: string): never {
  const reasonText = reason ? `: ${reason}` : ''
  const message = `Invalid parameter '${parameterName}'${reasonText}`
  throw new Error(formatError(ErrorCodes.INVALID_PARAMETER, message, { parameterName, reason }))
}

/**
 * Throw an operation not allowed error
 * @param operation - The operation being attempted
 * @param reason - The reason it's not allowed
 * @example throwOperationNotAllowedError('withdraw enrollment', 'enrollment is already completed')
 */
export function throwOperationNotAllowedError(operation: string, reason: string): never {
  const message = `Cannot ${operation}: ${reason}`
  throw new Error(formatError(ErrorCodes.OPERATION_NOT_ALLOWED, message, { operation, reason }))
}

/**
 * Throw a quota exceeded error
 * @param quotaName - The name of the quota that was exceeded
 * @param limit - Optional limit value
 * @example throwQuotaExceededError('maximum students per guardian', '10')
 */
export function throwQuotaExceededError(quotaName: string, limit?: string | number): never {
  const limitText = limit ? ` (limit: ${limit})` : ''
  const message = `${quotaName} exceeded${limitText}`
  throw new Error(formatError(ErrorCodes.QUOTA_EXCEEDED, message, { quotaName, limit }))
}

/**
 * Throw an expired error
 * @param entityName - The entity that has expired
 * @example throwExpiredError('Session')
 */
export function throwExpiredError(entityName: string): never {
  const message = `${entityName} has expired`
  throw new Error(formatError(ErrorCodes.EXPIRED, message, { entityName }))
}

/**
 * Throw an unauthorized operation error
 * @param operation - The operation being attempted
 * @example throwUnauthorizedOperationError('add student to this guardian')
 */
export function throwUnauthorizedOperationError(operation: string): never {
  const message = `Not authorized to ${operation}`
  throw new Error(formatError(ErrorCodes.UNAUTHORIZED_OPERATION, message, { operation }))
}

/**
 * Throw a permission denied error with specific permission name
 * @param permission - The permission that is required
 * @param metadata - Optional additional metadata
 * @example throwPermissionError('projects.create')
 * @example throwPermissionError('projects.edit', { module: 'Projects', action: 'You need edit permission' })
 */
export function throwPermissionError(
  permission: string,
  metadata?: Partial<Omit<ErrorMetadata, 'code' | 'permission'>>
): never {
  const msg = metadata?.action || `Permission denied: ${permission}`
  const fullMetadata = { permission, ...metadata }
  throw new Error(formatError(ErrorCodes.PERMISSION_DENIED, msg, fullMetadata))
}

/**
 * Throw an authentication required error
 * @param message - Optional custom message
 * @example throwAuthRequiredError('Please log in to continue')
 */
export function throwAuthRequiredError(message?: string): never {
  const msg = message || 'Authentication required'
  throw new Error(formatError(ErrorCodes.AUTH_REQUIRED, msg, {}))
}

/**
 * Throw an admin required error
 * @param message - Optional custom message
 * @example throwAdminRequiredError('This action requires admin privileges')
 */
export function throwAdminRequiredError(message?: string): never {
  const msg = message || 'Admin access required'
  throw new Error(formatError(ErrorCodes.ADMIN_REQUIRED, msg, {}))
}

/**
 * Type-safe error throwing with return type never
 * Helps TypeScript understand control flow
 */
export function throwError(
  message: string,
  metadata?: Partial<ErrorMetadata>
): never {
  throw new Error(formatError(ErrorCodes.AUTH_REQUIRED, message, metadata))
}
