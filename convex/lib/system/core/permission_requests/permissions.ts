// convex/lib/system/core/permission_requests/permissions.ts
// Access control and authorization logic for permissionRequests module

import { PERMISSION_REQUESTS_CONSTANTS } from './constants';
import { UserProfile } from '@/schema/system';
import { PermissionRequest } from './types';


/**
 * Check if user can view a permission request
 * Users can view their own requests, admins can view all
 */
export function canViewPermissionRequest(request: PermissionRequest, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return request.ownerId === user._id;
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
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.CREATE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return true;
}

export function requireCreatePermissionRequestAccess(user: UserProfile): void {
  if (!canCreatePermissionRequest(user)) {
    throw new Error('You do not have permission to create permission requests');
  }
}

/**
 * Check if user can approve permission requests
 * Only admins can approve requests
 */
export function canApprovePermissionRequest(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.APPROVE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireApprovePermissionRequestAccess(user: UserProfile): void {
  if (!canApprovePermissionRequest(user)) {
    throw new Error('You do not have permission to approve permission requests');
  }
}

/**
 * Check if user can deny permission requests
 * Only admins can deny requests
 */
export function canDenyPermissionRequest(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.DENY) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireDenyPermissionRequestAccess(user: UserProfile): void {
  if (!canDenyPermissionRequest(user)) {
    throw new Error('You do not have permission to deny permission requests');
  }
}

/**
 * Check if user can cancel a permission request
 * Users can cancel their own pending requests, admins can cancel any
 */
export function canCancelPermissionRequest(request: PermissionRequest, user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(PERMISSION_REQUESTS_CONSTANTS.PERMISSIONS.CANCEL) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  // Users can cancel their own pending requests
  if (request.ownerId === user._id && request.status === 'pending') {
    return true;
  }

  return false;
}

export function requireCancelPermissionRequestAccess(request: PermissionRequest, user: UserProfile): void {
  if (!canCancelPermissionRequest(request, user)) {
    throw new Error('You do not have permission to cancel this permission request');
  }
}
