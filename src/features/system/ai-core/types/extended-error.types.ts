/**
 * Extended error types for enhanced error handling across the application.
 * Provides type-safe access to error properties like code and details.
 */

/**
 * Extended error interface that includes additional properties
 * commonly used in application error handling.
 */
export interface ExtendedError extends Error {
  /** Optional error code for categorizing errors */
  code?: string;

  /** Detailed error information */
  details?: {
    /** Original error that caused this error */
    originalError?: Error;
    /** Service provider where error occurred */
    provider?: string;
    /** Operation that was being performed */
    operation?: string;
    /** Technical details about the error */
    technicalDetails?: string;
    /** Timestamp when error occurred */
    timestamp?: string;
    /** Underlying cause of the error */
    cause?: unknown;
  };
}

/**
 * Type guard to check if an error is an ExtendedError.
 *
 * @param error - The error to check
 * @returns True if the error has extended properties
 */
export function isExtendedError(error: unknown): error is ExtendedError {
  return error instanceof Error && ('code' in error || 'details' in error);
}

/**
 * Helper to safely get error code from any error object.
 *
 * @param error - The error object
 * @returns The error code if present, undefined otherwise
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && 'code' in error) {
    const extendedError = error as ExtendedError;
    return extendedError.code;
  }
  return undefined;
}

/**
 * Helper to safely get error details from any error object.
 *
 * @param error - The error object
 * @returns The error details if present, undefined otherwise
 */
export function getErrorDetails(error: unknown): ExtendedError['details'] | undefined {
  if (error instanceof Error && 'details' in error) {
    const extendedError = error as ExtendedError;
    return extendedError.details;
  }
  return undefined;
}
