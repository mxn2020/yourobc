// convex/lib/boilerplate/permission_requests/utils.ts
// Utility functions for permissionRequests module

/**
 * Validate permission string format
 */
export function isValidPermission(permission: string): boolean {
  // Permission format: module.action (e.g., 'projects.create', 'users.delete')
  const permissionRegex = /^[a-z_]+\.[a-z_]+$/;
  return permissionRegex.test(permission);
}

/**
 * Extract module from permission string
 */
export function extractModule(permission: string): string {
  const parts = permission.split('.');
  return parts[0] || '';
}

/**
 * Validate request status transition
 */
export function isValidStatusTransition(
  currentStatus: string,
  newStatus: string
): { valid: boolean; error?: string } {
  // pending -> approved or denied
  if (currentStatus === 'pending') {
    if (newStatus === 'approved' || newStatus === 'denied') {
      return { valid: true };
    }
    return { valid: false, error: 'Invalid status transition from pending' };
  }

  // approved/denied cannot be changed
  if (currentStatus === 'approved' || currentStatus === 'denied') {
    return { valid: false, error: 'Cannot change status of reviewed request' };
  }

  return { valid: false, error: 'Invalid current status' };
}
