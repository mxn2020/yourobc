// convex/lib/system/auditLogs/utils.ts
// Utility functions for audit logs module

import { trimString } from '@/shared/utils/helper';
import { AUDIT_LOG_CONSTANTS } from './constants';

/**
 * Trim audit log data
 * Removes leading/trailing whitespace from string fields
 */
export function trimAuditLogData(data: any) {
  return {
    ...data,
    action: trimString(data.action),
    entityType: trimString(data.entityType),
    entityId: data.entityId ? trimString(data.entityId) : undefined,
    entityTitle: data.entityTitle ? trimString(data.entityTitle) : undefined,
    description: trimString(data.description),
  };
}

/**
 * Validate audit log data
 * Returns array of validation errors (empty if valid)
 */
export function validateAuditLogData(data: any): string[] {
  const errors: string[] = [];

  // Validate required fields
  if (!data.action || data.action.length === 0) {
    errors.push('Action is required');
  }

  if (!data.entityType || data.entityType.length === 0) {
    errors.push('Entity type is required');
  }

  if (!data.description || data.description.length === 0) {
    errors.push('Description is required');
  }

  // Validate field lengths
  if (data.description && data.description.length > AUDIT_LOG_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${AUDIT_LOG_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.action && data.action.length > 100) {
    errors.push('Action must be less than 100 characters');
  }

  if (data.entityType && data.entityType.length > 100) {
    errors.push('Entity type must be less than 100 characters');
  }

  return errors;
}

/**
 * Format audit log description
 * Creates a standardized description string
 */
export function formatAuditLogDescription(
  action: string,
  entityType: string,
  entityTitle?: string
): string {
  const capitalizedAction = action.charAt(0).toUpperCase() + action.slice(1);
  return `${capitalizedAction} ${entityType}${entityTitle ? `: ${entityTitle}` : ''}`;
}

/**
 * Sanitize metadata
 * Removes sensitive information from metadata before logging
 */
export function sanitizeMetadata(metadata: any): any {
  if (!metadata) return metadata;

  const sanitized = { ...metadata };

  // Remove sensitive fields
  const sensitiveFields = ['password', 'token', 'apiKey', 'secret', 'accessToken', 'refreshToken'];

  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  // Recursively sanitize nested objects
  if (sanitized.oldValues) {
    sanitized.oldValues = sanitizeMetadata(sanitized.oldValues);
  }
  if (sanitized.newValues) {
    sanitized.newValues = sanitizeMetadata(sanitized.newValues);
  }

  return sanitized;
}

/**
 * Calculate changed fields
 * Compares old and new values to identify which fields changed
 */
export function calculateChangedFields(
  oldValues: Record<string, any>,
  newValues: Record<string, any>
): string[] {
  const changedFields: string[] = [];

  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);

  for (const key of allKeys) {
    const oldVal = oldValues?.[key];
    const newVal = newValues?.[key];

    // Simple comparison (not deep equality)
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changedFields.push(key);
    }
  }

  return changedFields;
}
