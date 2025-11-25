// convex/lib/system/app_configs/permissions.ts
// Access control and authorization logic for appConfigs module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import type { Doc } from '@/generated/dataModel';
import type { AppConfig } from './types';
import { APP_CONFIGS_CONSTANTS } from './constants';


// ============================================================================
// View Access
// ============================================================================

/**
 * Check if user can view a specific app config
 * Resource-based access control
 */
export async function canViewAppConfig(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.VIEW) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  // User-scoped configs can be viewed by the owner
  if (config.scope === APP_CONFIGS_CONSTANTS.SCOPES.USER && config.ownerId === user.authUserId) {
    return true;
  }

  // Visible configs can be viewed by authenticated users
  if (config.isVisible) {
    return true;
  }

  return false;
}

export async function requireViewAppConfigAccess(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canViewAppConfig(ctx, config, user))) {
    throw new Error('You do not have permission to view this app configuration');
  }
}

/**
 * Check if user can view app configs (general permission)
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

// ============================================================================
// Create Access
// ============================================================================

/**
 * Check if user can create app configs
 */
export function canCreateAppConfig(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.CREATE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireCreateAppConfigAccess(user: UserProfile): void {
  if (!canCreateAppConfig(user)) {
    throw new Error('You do not have permission to create app configurations');
  }
}

// ============================================================================
// Edit Access
// ============================================================================

/**
 * Check if user can edit a specific app config
 * Resource-based access control
 */
export async function canEditAppConfig(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Admins can edit all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check if config is editable
  if (!config.isEditable) {
    return false;
  }

  // Check explicit permission
  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.EDIT) ||
    user.permissions.includes('*')
  ) {
    // User-scoped configs can only be edited by owner (even with edit permission)
    if (config.scope === APP_CONFIGS_CONSTANTS.SCOPES.USER) {
      return config.ownerId === user.authUserId;
    }
    return true;
  }

  // User-scoped configs can be edited by the owner
  if (config.scope === APP_CONFIGS_CONSTANTS.SCOPES.USER && config.ownerId === user.authUserId) {
    return config.isEditable;
  }

  return false;
}

export async function requireEditAppConfigAccess(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canEditAppConfig(ctx, config, user))) {
    throw new Error('You do not have permission to edit this app configuration');
  }
}

/**
 * Check if user can edit app configs (general permission)
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

// ============================================================================
// Delete Access
// ============================================================================

/**
 * Check if user can delete a specific app config
 * Resource-based access control
 */
export async function canDeleteAppConfig(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<boolean> {
  // Only admins can delete
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  // Check explicit permission
  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.DELETE) ||
    user.permissions.includes('*')
  ) {
    // Can only delete user-scoped configs that they own
    if (config.scope === APP_CONFIGS_CONSTANTS.SCOPES.USER && config.ownerId === user.authUserId) {
      return true;
    }
  }

  return false;
}

export async function requireDeleteAppConfigAccess(
  ctx: QueryCtx | MutationCtx,
  config: AppConfig,
  user: UserProfile
): Promise<void> {
  if (!(await canDeleteAppConfig(ctx, config, user))) {
    throw new Error('You do not have permission to delete this app configuration');
  }
}

/**
 * Check if user can delete app configs (general permission)
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

// ============================================================================
// Bulk Operations Access
// ============================================================================

/**
 * Check if user can perform bulk operations on app configs
 */
export function canBulkEditAppConfigs(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.BULK_EDIT) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireBulkEditAppConfigsAccess(user: UserProfile): void {
  if (!canBulkEditAppConfigs(user)) {
    throw new Error('You do not have permission to perform bulk operations on app configurations');
  }
}

// ============================================================================
// Restore Access
// ============================================================================

/**
 * Check if user can restore deleted app configs
 */
export function canRestoreAppConfig(user: UserProfile): boolean {
  if (user.role === 'admin' || user.role === 'superadmin') {
    return true;
  }

  if (
    user.permissions.includes(APP_CONFIGS_CONSTANTS.PERMISSIONS.RESTORE) ||
    user.permissions.includes('*')
  ) {
    return true;
  }

  return false;
}

export function requireRestoreAppConfigAccess(user: UserProfile): void {
  if (!canRestoreAppConfig(user)) {
    throw new Error('You do not have permission to restore app configurations');
  }
}

// ============================================================================
// Filtering Functions
// ============================================================================

/**
 * Filter app configs based on user access
 */
export async function filterAppConfigsByAccess(
  ctx: QueryCtx | MutationCtx,
  configs: AppConfig[],
  user: UserProfile
): Promise<AppConfig[]> {
  // Admins can see all
  if (user.role === 'admin' || user.role === 'superadmin') {
    return configs;
  }

  // Filter based on access
  const accessibleConfigs: AppConfig[] = [];
  for (const config of configs) {
    if (await canViewAppConfig(ctx, config, user)) {
      accessibleConfigs.push(config);
    }
  }

  return accessibleConfigs;
}
