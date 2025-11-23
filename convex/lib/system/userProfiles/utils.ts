// convex/lib/system/user_profiles/user_profiles/utils.ts
// Validation functions and utilities for user_profiles module

import { USER_PROFILES_CONSTANTS } from './constants';
import type { UserProfile, UserProfileMetadata, UserRole } from './types';
import { Id } from '@/generated/dataModel';

// Import Better Auth role definitions for permission extraction
import {
  userRole,
  moderatorRole,
  editorRole,
  analystRole,
  guestRole,
} from '../../../../src/features/system/auth/lib/auth-permissions';

// ============================================================================
// Better Auth Role Permissions Integration
// ============================================================================

/**
 * Flattens a Better Auth role object's permissions to dot-notation strings
 * Transforms { project: ['create', 'read'], crm: [...] } to ['project.create', 'project.read', ...]
 * Filters out non-permission properties like 'authorize' method
 */
function flattenRolePermissions(roleObject: Record<string, unknown>): string[] {
  const flattened: string[] = [];

  for (const [namespace, actions] of Object.entries(roleObject)) {
    // Skip non-permission properties (like 'authorize' method)
    if (typeof actions === 'function' || !Array.isArray(actions)) {
      continue;
    }

    // Process permission arrays
    for (const action of actions) {
      if (typeof action === 'string') {
        flattened.push(`${namespace}.${action}`);
      }
    }
  }

  return flattened;
}

/**
 * Role permission mappings extracted from Better Auth role definitions
 * Single source of truth: auth-permissions.ts
 */
const BETTER_AUTH_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  superadmin: ['*'],
  admin: ['*'],
  user: flattenRolePermissions(userRole),
  moderator: flattenRolePermissions(moderatorRole),
  editor: flattenRolePermissions(editorRole),
  analyst: flattenRolePermissions(analystRole),
  guest: flattenRolePermissions(guestRole),
};

// ============================================================================
// Default Profile Creation
// ============================================================================

export function getDefaultUserProfile(
  authUserId: string,
  email: string,
  name?: string,
  extendedMetadata?: UserProfileMetadata
): Omit<UserProfile, '_id' | '_creationTime' | 'createdBy' | 'publicId'> {
  const now = Date.now();

  return {
    authUserId,
    email,
    name: name || undefined,
    avatar: undefined,
    bio: undefined,
    role: 'user',
    permissions: [...BETTER_AUTH_ROLE_PERMISSIONS.user],

    // Better Auth sync fields with defaults
    banned: false,
    banReason: undefined,
    banExpires: undefined,
    authCreatedAt: undefined,
    authUpdatedAt: undefined,

    stats: {
      karmaLevel: 0,
      tasksCompleted: 0,
      tasksAssigned: 0,
      projectsCreated: 0,
      loginCount: 1,
      totalAIRequests: 0,
      totalAICost: 0,
    },
    badges: [],
    lastActiveAt: now,
    lastLoginAt: now,
    ipAddress: undefined,
    userAgent: undefined,
    isActive: true,
    isEmailVerified: false,
    isProfileComplete: false,
    createdAt: now,
    // createdBy will be set after profile creation (self-referential)
    updatedAt: now,

    extendedMetadata: extendedMetadata || undefined,
    deletedAt: undefined,
    deletedBy: undefined,
    updatedBy: undefined,
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

export function validateUserProfileData(data: Partial<UserProfile>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (data.name && data.name.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name must be less than ${USER_PROFILES_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }
    if (data.name && data.name.length < USER_PROFILES_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${USER_PROFILES_CONSTANTS.LIMITS.MIN_NAME_LENGTH} character`);
    }
  }

  if (data.bio !== undefined) {
    if (data.bio && data.bio.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_BIO_LENGTH) {
      errors.push(`Bio must be less than ${USER_PROFILES_CONSTANTS.LIMITS.MAX_BIO_LENGTH} characters`);
    }
  }

  if (data.permissions && data.permissions.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_PERMISSIONS) {
    errors.push(`Maximum ${USER_PROFILES_CONSTANTS.LIMITS.MAX_PERMISSIONS} permissions allowed`);
  }

  if (data.badges && data.badges.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_BADGES) {
    errors.push(`Maximum ${USER_PROFILES_CONSTANTS.LIMITS.MAX_BADGES} badges allowed`);
  }

  if (data.extendedMetadata?.notes && data.extendedMetadata.notes.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_METADATA_NOTES_LENGTH) {
    errors.push(`Metadata notes must be less than ${USER_PROFILES_CONSTANTS.LIMITS.MAX_METADATA_NOTES_LENGTH} characters`);
  }

  if (data.extendedMetadata?.tags && data.extendedMetadata.tags.length > USER_PROFILES_CONSTANTS.LIMITS.MAX_METADATA_TAGS) {
    errors.push(`Maximum ${USER_PROFILES_CONSTANTS.LIMITS.MAX_METADATA_TAGS} metadata tags allowed`);
  }

  return errors;
}

// ============================================================================
// Profile Status Functions
// ============================================================================

export function isProfileComplete(profile: UserProfile): boolean {
  return !!(profile.name && profile.avatar && profile.bio);
}

// ============================================================================
// Karma & Rewards
// ============================================================================

export function calculateKarmaReward(activityType: string): number {
  switch (activityType) {
    case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.TASK_COMPLETED:
      return USER_PROFILES_CONSTANTS.KARMA_REWARDS.TASK_COMPLETED;
    case USER_PROFILES_CONSTANTS.ACTIVITY_TYPES.PROJECT_CREATED:
      return USER_PROFILES_CONSTANTS.KARMA_REWARDS.PROJECT_CREATED;
    default:
      return 0;
  }
}

// ============================================================================
// Permission Functions
// ============================================================================

export function hasPermission(user: UserProfile, permission: string): boolean {
  // Superadmin and admin have all permissions
  if (user.role === 'admin' || user.role === 'superadmin') return true;
  // Check for wildcard or specific permission
  return user.permissions.includes(permission) || user.permissions.includes('*');
}

export function getRolePermissions(role: UserRole): string[] {
  // Get permissions from Better Auth role definitions (single source of truth)
  // Falls back to user role if the role is not found
  const permissions = BETTER_AUTH_ROLE_PERMISSIONS[role] || BETTER_AUTH_ROLE_PERMISSIONS.user;
  return [...permissions];
}

export function validateRolePermissions(): {
  valid: boolean;
  missingRoles?: string[];
} {
  const roles: UserRole[] = [
    'superadmin',
    'admin',
    'user',
    'moderator',
    'editor',
    'analyst',
    'guest',
  ];

  const missingRoles = roles.filter(
    (role) => !BETTER_AUTH_ROLE_PERMISSIONS[role] || BETTER_AUTH_ROLE_PERMISSIONS[role].length === 0
  );

  return {
    valid: missingRoles.length === 0,
    missingRoles: missingRoles.length > 0 ? missingRoles : undefined,
  };
}

// ============================================================================
// Extended Metadata Functions
// ============================================================================

export function updateExtendedMetadata(
  existingMetadata: UserProfileMetadata | undefined,
  updates: Partial<UserProfileMetadata>
): UserProfileMetadata {
  const current = existingMetadata || {};

  return {
    ...current,
    ...updates,
    // Merge custom fields if both exist
    customFields: {
      ...(current.customFields || {}),
      ...(updates.customFields || {})
    },
    // Merge tags if both exist
    tags: updates.tags !== undefined ? updates.tags : current.tags,
  };
}

export function addExtendedMetadataTag(
  existingMetadata: UserProfileMetadata | undefined,
  tag: string
): UserProfileMetadata {
  const current = existingMetadata || {};
  const currentTags = current.tags || [];

  if (!currentTags.includes(tag)) {
    return {
      ...current,
      tags: [...currentTags, tag]
    };
  }

  return current;
}

export function removeExtendedMetadataTag(
  existingMetadata: UserProfileMetadata | undefined,
  tag: string
): UserProfileMetadata {
  const current = existingMetadata || {};
  const currentTags = current.tags || [];

  return {
    ...current,
    tags: currentTags.filter(t => t !== tag)
  };
}

// ============================================================================
// Display Name Formatting
// ============================================================================

export function formatUserDisplayName(profile: UserProfile): string {
  return profile.name || profile.email || 'Unknown User';
}
