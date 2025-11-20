// convex/lib/boilerplate/app_configs/permissions.ts
// Access control and authorization logic for appConfigs module

import type { Doc } from '@/generated/dataModel';
import { APP_CONFIGS_CONSTANTS } from './constants';

type UserProfile = Doc<'userProfiles'>;

/**
 * Check if user can view app configs
 * Admins can view all, regular users can view public/visible configs
 */
export function canViewAppConfigs(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireViewAppConfigsAccess(user: UserProfile): void {
  if (!canViewAppConfigs(user)) {
    throw new Error('You do not have permission to view app configurations');
  }
}

/**
 * Check if user can edit app configs
 * Only admins can edit configs
 */
export function canEditAppConfigs(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireEditAppConfigsAccess(user: UserProfile): void {
  if (!canEditAppConfigs(user)) {
    throw new Error('You do not have permission to edit app configurations');
  }
}

/**
 * Check if user can delete app configs
 * Only admins can delete configs
 */
export function canDeleteAppConfigs(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireDeleteAppConfigsAccess(user: UserProfile): void {
  if (!canDeleteAppConfigs(user)) {
    throw new Error('You do not have permission to delete app configurations');
  }
}
