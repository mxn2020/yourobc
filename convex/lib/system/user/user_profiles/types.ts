// convex/lib/system/user/user_profiles/types.ts
// Business types and interfaces for user_profiles module

import type { Doc, Id } from '@/generated/dataModel';
import type { USER_PROFILES_CONSTANTS } from './constants';
import type { UserRole } from 'types';

// Core entity types
export type UserProfile = Doc<'userProfiles'>;
export type UserProfileId = Id<'userProfiles'>;

// Extended metadata interface
export interface UserProfileMetadata {
  recoveredAt?: number;
  recoveredFrom?: string;
  syncSource?: string;
  migrationVersion?: string;
  customFields?: Record<string, any>;
  tags?: string[];
  notes?: string;
}

// Create/Update data transfer objects
export interface CreateUserProfileData {
  authUserId: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  ipAddress?: string;
  userAgent?: string;
  metadata?: UserProfileMetadata;
}

export interface UpdateUserProfileData {
  name?: string;
  avatar?: string;
  bio?: string;
  metadata?: Partial<UserProfileMetadata>;
}

export interface UpdateUserRoleData {
  targetUserId: UserProfileId;
  newRole: UserRole;
  permissions?: string[];
}

export interface UserActivityData {
  activityType?: typeof USER_PROFILES_CONSTANTS.ACTIVITY_TYPES[keyof typeof USER_PROFILES_CONSTANTS.ACTIVITY_TYPES];
  metadata?: {
    cost?: number;
    ipAddress?: string;
    userAgent?: string;
  };
}

// Query filters and options
export interface UserProfileFilters {
  role?: UserRole;
  isActive?: boolean;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
  search?: string;
}

export interface UserProfileListOptions {
  limit?: number;
  offset?: number;
  filters?: UserProfileFilters;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
}

// Statistics interface
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  completeProfiles: number;
  totalAIRequests: number;
  totalAICost: number;
  totalKarma: number;
  avgAIRequestsPerUser: number;
  avgKarmaPerUser: number;
  timeWindow?: 'week' | 'month' | 'all';
  dataLimited?: boolean;
}

// Re-export UserRole for convenience
export type { UserRole };
