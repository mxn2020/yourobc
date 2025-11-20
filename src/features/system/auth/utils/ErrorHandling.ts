// src/features/boilerplate/utils/ErrorHandling.ts
import { AuthenticationError, AuthErrorCode, ProfileError, ProfileErrorCode } from '../types/auth.types'

// === Error Code Constants ===
export const AUTH_ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_EXISTS: 'USER_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // OAuth errors
  OAUTH_ERROR: 'OAUTH_ERROR',
  OAUTH_CANCELLED: 'OAUTH_CANCELLED',
  OAUTH_ACCESS_DENIED: 'OAUTH_ACCESS_DENIED',
  
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export const PROFILE_ERROR_CODES = {
  // Profile errors
  PROFILE_NOT_FOUND: 'PROFILE_NOT_FOUND',
  PROFILE_INCOMPLETE: 'PROFILE_INCOMPLETE',
  UPDATE_FAILED: 'UPDATE_FAILED',
  SYNC_FAILED: 'SYNC_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // Validation errors
  INVALID_DATA: 'INVALID_DATA',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',
  
  // Unknown
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

// === Error Messages ===
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'No account found with this email',
  [AUTH_ERROR_CODES.USER_EXISTS]: 'An account with this email already exists',
  [AUTH_ERROR_CODES.WEAK_PASSWORD]: 'Password is too weak. Please choose a stronger password',
  [AUTH_ERROR_CODES.INVALID_EMAIL]: 'Please enter a valid email address',
  [AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please try again later',
  [AUTH_ERROR_CODES.NOT_AUTHENTICATED]: 'You must be logged in to perform this action',
  [AUTH_ERROR_CODES.SESSION_EXPIRED]: 'Your session has expired. Please log in again',
  [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]: 'Please verify your email address before continuing',
  [AUTH_ERROR_CODES.OAUTH_ERROR]: 'Social login failed. Please try again',
  [AUTH_ERROR_CODES.OAUTH_CANCELLED]: 'Login was cancelled',
  [AUTH_ERROR_CODES.OAUTH_ACCESS_DENIED]: 'Access was denied. Please grant permission to continue',
  [AUTH_ERROR_CODES.NETWORK_ERROR]: 'Network error. Please check your connection',
  [AUTH_ERROR_CODES.SERVER_ERROR]: 'Server error. Please try again later',
  [AUTH_ERROR_CODES.TIMEOUT]: 'Request timed out. Please try again',
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
}

const PROFILE_ERROR_MESSAGES: Record<string, string> = {
  [PROFILE_ERROR_CODES.PROFILE_NOT_FOUND]: 'Profile not found',
  [PROFILE_ERROR_CODES.PROFILE_INCOMPLETE]: 'Please complete your profile',
  [PROFILE_ERROR_CODES.UPDATE_FAILED]: 'Failed to update profile. Please try again',
  [PROFILE_ERROR_CODES.SYNC_FAILED]: 'Failed to sync profile data',
  [PROFILE_ERROR_CODES.PERMISSION_DENIED]: 'You don\'t have permission to perform this action',
  [PROFILE_ERROR_CODES.INVALID_DATA]: 'Invalid data provided',
  [PROFILE_ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Please fill in all required fields',
  [PROFILE_ERROR_CODES.DATABASE_ERROR]: 'Database error. Please try again',
  [PROFILE_ERROR_CODES.QUERY_FAILED]: 'Failed to load data. Please refresh the page',
  [PROFILE_ERROR_CODES.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again',
}

// === Error Factory Functions ===
export function createAuthError(
  code: AuthErrorCode, 
  customMessage?: string, 
  details?: Record<string, any>
): AuthenticationError {
  const message = customMessage || AUTH_ERROR_MESSAGES[code] || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
  return new AuthenticationError(code, message, details)
}

export function createProfileError(
  code: ProfileErrorCode, 
  customMessage?: string, 
  details?: Record<string, any>
): ProfileError {
  const message = customMessage || PROFILE_ERROR_MESSAGES[code] || PROFILE_ERROR_MESSAGES[PROFILE_ERROR_CODES.UNKNOWN_ERROR]
  return new ProfileError(code, message, details)
}

// === Error Parsing Utilities ===
export function parseAuthError(error: any): AuthenticationError {
  if (error instanceof AuthenticationError) {
    return error
  }

  let code = '' as AuthErrorCode
  let message = 'Authentication failed. Please try again'
  let details: Record<string, any> = {}

  code = AUTH_ERROR_CODES.UNKNOWN_ERROR

  // Handle different error formats
  if (typeof error === 'string') {
    message = error
  } else if (error?.message) {
    message = error.message
  } else if (error?.error?.message) {
    message = error.error.message
  }

  // Handle specific error codes
  if (error?.code) {
    code = error.code
    if (AUTH_ERROR_MESSAGES[code]) {
      message = AUTH_ERROR_MESSAGES[code]
    } else {
      message = AUTH_ERROR_MESSAGES[code]
    }
  } else {
    // Try to infer error code from message
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('credential') || lowerMessage.includes('password')) {
      code = AUTH_ERROR_CODES.INVALID_CREDENTIALS
    } else if (lowerMessage.includes('not found') || lowerMessage.includes('no user')) {
      code = AUTH_ERROR_CODES.USER_NOT_FOUND
    } else if (lowerMessage.includes('already exists') || lowerMessage.includes('duplicate')) {
      code = AUTH_ERROR_CODES.USER_EXISTS
    } else if (lowerMessage.includes('weak') || lowerMessage.includes('password')) {
      code = AUTH_ERROR_CODES.WEAK_PASSWORD
    } else if (lowerMessage.includes('email') && lowerMessage.includes('invalid')) {
      code = AUTH_ERROR_CODES.INVALID_EMAIL
    } else if (lowerMessage.includes('rate limit') || lowerMessage.includes('too many')) {
      code = AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED
    } else if (lowerMessage.includes('network') || lowerMessage.includes('connection')) {
      code = AUTH_ERROR_CODES.NETWORK_ERROR
    } else if (lowerMessage.includes('timeout')) {
      code = AUTH_ERROR_CODES.TIMEOUT
    }
  }

  if (error?.details) {
    details = error.details
  }

  return createAuthError(code, message, { ...details, originalError: error })
}

export function parseProfileError(error: any): ProfileError {
  if (error instanceof ProfileError) {
    return error
  }

  let code = '' as ProfileErrorCode
  let message = 'Profile operation failed. Please try again'
  let details: Record<string, any> = {}

  code = PROFILE_ERROR_CODES.UNKNOWN_ERROR

  // Handle different error formats
  if (typeof error === 'string') {
    message = error
  } else if (error?.message) {
    message = error.message
  }

  // Handle specific error codes
  if (error?.code) {
    code = error.code
    if (PROFILE_ERROR_MESSAGES[code]) {
      message = PROFILE_ERROR_MESSAGES[code]
    } else {
      message = PROFILE_ERROR_MESSAGES[code]
    }
  } else {
    // Try to infer error code from message
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('not found')) {
      code = PROFILE_ERROR_CODES.PROFILE_NOT_FOUND
    } else if (lowerMessage.includes('permission') || lowerMessage.includes('unauthorized')) {
      code = PROFILE_ERROR_CODES.PERMISSION_DENIED
    } else if (lowerMessage.includes('invalid') || lowerMessage.includes('validation')) {
      code = PROFILE_ERROR_CODES.INVALID_DATA
    } else if (lowerMessage.includes('required') || lowerMessage.includes('missing')) {
      code = PROFILE_ERROR_CODES.MISSING_REQUIRED_FIELD
    } else if (lowerMessage.includes('database') || lowerMessage.includes('db')) {
      code = PROFILE_ERROR_CODES.DATABASE_ERROR
    } else if (lowerMessage.includes('query') || lowerMessage.includes('fetch')) {
      code = PROFILE_ERROR_CODES.QUERY_FAILED
    }
  }

  if (error?.details) {
    details = error.details
  }

  return createProfileError(code, message, { ...details, originalError: error })
}

// === Error Display Utilities ===
export function getErrorMessage(error: AuthenticationError | ProfileError | Error): string {
  if (error instanceof AuthenticationError || error instanceof ProfileError) {
    return error.message
  }
  return error.message || 'An unexpected error occurred'
}

export function isRetryableError(error: AuthenticationError | ProfileError): boolean {
  const retryableCodes = [
    AUTH_ERROR_CODES.NETWORK_ERROR,
    AUTH_ERROR_CODES.SERVER_ERROR,
    AUTH_ERROR_CODES.TIMEOUT,
    PROFILE_ERROR_CODES.DATABASE_ERROR,
    PROFILE_ERROR_CODES.QUERY_FAILED,
  ] as const
  
  return (retryableCodes as readonly string[]).includes(error.code)
}

export function getErrorSeverity(error: AuthenticationError | ProfileError): 'low' | 'medium' | 'high' {
  const highSeverityCodes = [
    AUTH_ERROR_CODES.NOT_AUTHENTICATED,
    AUTH_ERROR_CODES.SESSION_EXPIRED,
    PROFILE_ERROR_CODES.PERMISSION_DENIED,
  ] as const
  
  const mediumSeverityCodes = [
    AUTH_ERROR_CODES.INVALID_CREDENTIALS,
    AUTH_ERROR_CODES.USER_NOT_FOUND,
    PROFILE_ERROR_CODES.PROFILE_NOT_FOUND,
    PROFILE_ERROR_CODES.UPDATE_FAILED,
  ] as const
  
  if ((highSeverityCodes as readonly string[]).includes(error.code)) return 'high'
  if ((mediumSeverityCodes as readonly string[]).includes(error.code)) return 'medium'
  return 'low'
}

// === React Hook for Error Handling ===
export function useErrorHandler() {
  const handleAuthError = (error: any): AuthenticationError => {
    const authError = parseAuthError(error)
    console.error('Auth Error:', authError)
    return authError
  }

  const handleProfileError = (error: any): ProfileError => {
    const profileError = parseProfileError(error)
    console.error('Profile Error:', profileError)
    return profileError
  }

  return {
    handleAuthError,
    handleProfileError,
    getErrorMessage,
    isRetryableError,
    getErrorSeverity,
  }
}