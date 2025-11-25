// convex/lib/system/user_profiles/user_profiles/permissions.ts
// Access control and authorization logic for user_profiles module

import type { QueryCtx, MutationCtx } from '@/generated/server';
import { UserProfile } from '@/schema/system';
import { USER_PROFILES_CONSTANTS } from './constants';
import { hasPermission } from './utils';

// ============================================================================
// User Profile Access Control
// ============================================================================

export async function canViewUserProfile(
  ctx: QueryCtx | MutationCtx,
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<boolean> {
  // Admins and superadmins can view all profiles
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users can view their own profile
  if (currentUser._id === targetProfile._id) return true;

  // Users with user management permission can view all profiles
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  // For now, all active profiles are viewable (public profiles)
  // Can be restricted based on future visibility settings
  return targetProfile.isActive;
}

export async function requireViewUserProfileAccess(
  ctx: QueryCtx | MutationCtx,
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<void> {
  if (!(await canViewUserProfile(ctx, targetProfile, currentUser))) {
    throw new Error('You do not have permission to view this user profile');
  }
}

export async function canEditUserProfile(
  ctx: QueryCtx | MutationCtx,
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<boolean> {
  // Admins can edit all profiles
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users can edit their own profile
  if (currentUser._id === targetProfile._id) return true;

  // Users with user management permission can edit all profiles
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  return false;
}

export async function requireEditUserProfileAccess(
  ctx: QueryCtx | MutationCtx,
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<void> {
  if (!(await canEditUserProfile(ctx, targetProfile, currentUser))) {
    throw new Error('You do not have permission to edit this user profile');
  }
}

export async function canDeleteUserProfile(
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can delete profiles (soft delete)
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users with user management permission can delete profiles
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  return false;
}

export async function requireDeleteUserProfileAccess(
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<void> {
  if (!(await canDeleteUserProfile(targetProfile, currentUser))) {
    throw new Error('You do not have permission to delete this user profile');
  }
}

// ============================================================================
// Role & Permission Management
// ============================================================================

export async function canManageUserRole(
  currentUser: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can manage roles
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users with role assignment permission can manage roles
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.ROLE_ASSIGN)) return true;

  return false;
}

export async function requireManageUserRoleAccess(
  currentUser: UserProfile
): Promise<void> {
  if (!(await canManageUserRole(currentUser))) {
    throw new Error('You do not have permission to manage user roles');
  }
}

export async function canManageUserPermissions(
  currentUser: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can manage permissions
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users with user management permission can manage permissions
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  return false;
}

export async function requireManageUserPermissionsAccess(
  currentUser: UserProfile
): Promise<void> {
  if (!(await canManageUserPermissions(currentUser))) {
    throw new Error('You do not have permission to manage user permissions');
  }
}

// ============================================================================
// User Activation/Deactivation
// ============================================================================

export async function canActivateDeactivateUser(
  currentUser: UserProfile
): Promise<boolean> {
  // Only admins and superadmins can activate/deactivate users
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users with user management permission can activate/deactivate
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  return false;
}

export async function requireActivateDeactivateUserAccess(
  currentUser: UserProfile
): Promise<void> {
  if (!(await canActivateDeactivateUser(currentUser))) {
    throw new Error('You do not have permission to activate/deactivate users');
  }
}

// ============================================================================
// Metadata Management
// ============================================================================

export async function canEditUserMetadata(
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<boolean> {
  // Admins can edit all metadata
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') return true;

  // Users can edit their own metadata
  if (currentUser._id === targetProfile._id) return true;

  // Users with user management permission can edit all metadata
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) return true;

  return false;
}

export async function requireEditUserMetadataAccess(
  targetProfile: UserProfile,
  currentUser: UserProfile
): Promise<void> {
  if (!(await canEditUserMetadata(targetProfile, currentUser))) {
    throw new Error('You do not have permission to edit this user metadata');
  }
}

// ============================================================================
// Bulk Access Filtering
// ============================================================================

export async function filterUserProfilesByAccess(
  ctx: QueryCtx | MutationCtx,
  profiles: UserProfile[],
  currentUser: UserProfile
): Promise<UserProfile[]> {
  // Admins see everything
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
    return profiles;
  }

  // Users with user management permission see everything
  if (hasPermission(currentUser, USER_PROFILES_CONSTANTS.PERMISSIONS.USER_MANAGEMENT)) {
    return profiles;
  }

  // Regular users only see active profiles and their own profile
  const accessible: UserProfile[] = [];

  for (const profile of profiles) {
    if (await canViewUserProfile(ctx, profile, currentUser)) {
      accessible.push(profile);
    }
  }

  return accessible;
}

// ============================================================================
// Public Profile View
// ============================================================================

export function getPublicProfileView(profile: UserProfile): Partial<UserProfile> {
  // Return limited public data
  return {
    _id: profile._id,
    publicId: profile.publicId,
    authUserId: profile.authUserId,
    name: profile.name,
    avatar: profile.avatar,
    bio: profile.bio,
    role: profile.role,
    badges: profile.badges,
    stats: {
      karmaLevel: profile.stats.karmaLevel,
      tasksCompleted: profile.stats.tasksCompleted,
      projectsCreated: profile.stats.projectsCreated,
      tasksAssigned: 0,
      loginCount: 0,
      totalAIRequests: 0,
      totalAICost: 0,
    },
    isActive: profile.isActive,
    createdAt: profile.createdAt,
  } as Partial<UserProfile>;
}
