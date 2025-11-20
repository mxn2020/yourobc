// convex/lib/boilerplate/permission_requests/permissions.ts
// Access control and authorization logic for permissionRequests module

import type { Doc } from '@/generated/dataModel';

type UserProfile = Doc<'userProfiles'>;
type PermissionRequest = Doc<'permissionRequests'>;

/**
 * Check if user can view a permission request
 * Users can view their own requests, admins can view all
 */
export function canViewPermissionRequest(request: PermissionRequest, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return request.userId === user._id;
}

export function requireViewPermissionRequestAccess(request: PermissionRequest, user: UserProfile): void {
  if (!canViewPermissionRequest(request, user)) {
    throw new Error('You do not have permission to view this permission request');
  }
}

/**
 * Check if user can create a permission request
 * All authenticated users can create requests
 */
export function canCreatePermissionRequest(user: UserProfile): boolean {
  return true;
}

/**
 * Check if user can review/approve permission requests
 * Only admins can review requests
 */
export function canReviewPermissionRequest(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  return false;
}

export function requireReviewPermissionRequestAccess(user: UserProfile): void {
  if (!canReviewPermissionRequest(user)) {
    throw new Error('You do not have permission to review permission requests');
  }
}

/**
 * Check if user can delete a permission request
 * Users can delete their own pending requests, admins can delete any
 */
export function canDeletePermissionRequest(request: PermissionRequest, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Users can delete their own pending requests
  if (request.userId === user._id && request.status === 'pending') {
    return true;
  }

  return false;
}

export function requireDeletePermissionRequestAccess(request: PermissionRequest, user: UserProfile): void {
  if (!canDeletePermissionRequest(request, user)) {
    throw new Error('You do not have permission to delete this permission request');
  }
}
