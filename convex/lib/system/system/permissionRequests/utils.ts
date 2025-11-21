// convex/lib/system/system/permissionRequests/utils.ts
// Validation functions and utility helpers for permissionRequests module

import { PERMISSION_REQUESTS_CONSTANTS } from './constants';

export function validatePermissionRequestData(data: any): string[] {
  const errors: string[] = [];

  if (data.permission !== undefined) {
    const trimmed = data.permission.trim();
    if (!trimmed) {
      errors.push('Permission is required');
    } else if (trimmed.length < PERMISSION_REQUESTS_CONSTANTS.LIMITS.MIN_PERMISSION_LENGTH) {
      errors.push(`Permission must be at least ${PERMISSION_REQUESTS_CONSTANTS.LIMITS.MIN_PERMISSION_LENGTH} characters`);
    } else if (trimmed.length > PERMISSION_REQUESTS_CONSTANTS.LIMITS.MAX_PERMISSION_LENGTH) {
      errors.push(`Permission cannot exceed ${PERMISSION_REQUESTS_CONSTANTS.LIMITS.MAX_PERMISSION_LENGTH} characters`);
    }
  }

  return errors;
}
