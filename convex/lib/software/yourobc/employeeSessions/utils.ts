// convex/lib/software/yourobc/employeeSessions/utils.ts
// Validation functions and utility helpers for employeeSessions module

import { EMPLOYEE_SESSIONS_CONSTANTS } from './constants';
import type { CreateEmployeeSessionData, UpdateEmployeeSessionData } from './types';

/**
 * Validate employee session data for creation/update
 */
export function validateEmployeeSessionData(
  data: Partial<CreateEmployeeSessionData | UpdateEmployeeSessionData>
): string[] {
  const errors: string[] = [];

  // Validate notes
  if (data.notes !== undefined && data.notes.trim()) {
    const trimmed = data.notes.trim();
    if (trimmed.length > EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH) {
      errors.push(`Notes cannot exceed ${EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_NOTES_LENGTH} characters`);
    }
  }

  // Validate duration
  if ('duration' in data && data.duration !== undefined) {
    if (data.duration < EMPLOYEE_SESSIONS_CONSTANTS.VALIDATION.MIN_SESSION_DURATION_MINUTES) {
      errors.push(`Session duration must be at least ${EMPLOYEE_SESSIONS_CONSTANTS.VALIDATION.MIN_SESSION_DURATION_MINUTES} minute`);
    } else if (data.duration > EMPLOYEE_SESSIONS_CONSTANTS.VALIDATION.MAX_SESSION_DURATION_MINUTES) {
      errors.push(`Session duration cannot exceed ${EMPLOYEE_SESSIONS_CONSTANTS.VALIDATION.MAX_SESSION_DURATION_MINUTES} minutes`);
    }
  }

  // Validate breaks
  if ('breaks' in data && data.breaks) {
    if (data.breaks.length > EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_BREAKS_PER_SESSION) {
      errors.push(`Cannot exceed ${EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_BREAKS_PER_SESSION} breaks per session`);
    }
  }

  // Validate activity log
  if ('activityLog' in data && data.activityLog) {
    if (data.activityLog.length > EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_ACTIVITY_LOG_ENTRIES) {
      errors.push(`Cannot exceed ${EMPLOYEE_SESSIONS_CONSTANTS.LIMITS.MAX_ACTIVITY_LOG_ENTRIES} activity log entries`);
    }
  }

  return errors;
}

/**
 * Generate session ID
 */
export function generateSessionId(employeeId: string, startTime: number): string {
  return `session_${employeeId}_${startTime}`;
}

/**
 * Calculate session duration in minutes
 */
export function calculateSessionDuration(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / (1000 * 60));
}

/**
 * Calculate break duration
 */
export function calculateBreakDuration(startTime: number, endTime: number): number {
  return Math.floor((endTime - startTime) / (1000 * 60));
}

/**
 * Check if session is active
 */
export function isSessionActive(session: { status: string; endTime?: number }): boolean {
  return session.status === 'active' && !session.endTime;
}

/**
 * Format session display name
 */
export function formatSessionDisplayName(session: { sessionId: string; status?: string }): string {
  const statusBadge = session.status ? ` [${session.status}]` : '';
  return `${session.sessionId}${statusBadge}`;
}
