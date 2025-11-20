// convex/lib/boilerplate/system_metrics/permissions.ts
// Access control and authorization logic for systemMetrics module

import type { Doc } from '@/generated/dataModel';
import { SYSTEM_METRICS_CONSTANTS } from './constants';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view system metrics
 * Only admins can view metrics
 */
export function canViewSystemMetrics(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(SYSTEM_METRICS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireViewSystemMetricsAccess(user: UserProfile): void {
  if (!canViewSystemMetrics(user)) {
    throw new Error('You do not have permission to view system metrics');
  }
}

/**
 * Check if user can create system metrics
 * System function - typically called internally
 */
export function canCreateSystemMetrics(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(SYSTEM_METRICS_CONSTANTS.PERMISSIONS.CREATE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireCreateSystemMetricsAccess(user: UserProfile): void {
  if (!canCreateSystemMetrics(user)) {
    throw new Error('You do not have permission to create system metrics');
  }
}

/**
 * Check if user can delete system metrics
 * Only superadmins can delete metrics
 */
export function canDeleteSystemMetrics(user: UserProfile): boolean {
  if (user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(SYSTEM_METRICS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireDeleteSystemMetricsAccess(user: UserProfile): void {
  if (!canDeleteSystemMetrics(user)) {
    throw new Error('You do not have permission to delete system metrics');
  }
}
