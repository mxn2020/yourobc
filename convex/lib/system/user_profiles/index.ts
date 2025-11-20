// convex/lib/system/user_profiles/user_profiles/index.ts
// Public API exports for user_profiles module

// Constants
export { USER_PROFILES_CONSTANTS } from './user_profiles/constants';

// Types
export type * from './user_profiles/types';

// Utilities
export {
  getDefaultUserProfile,
  validateUserProfileData,
  isProfileComplete,
  calculateKarmaReward,
  hasPermission,
  getRolePermissions,
  validateRolePermissions,
  updateExtendedMetadata,
  addExtendedMetadataTag,
  removeExtendedMetadataTag,
  formatUserDisplayName,
} from './user_profiles/utils';

// Permissions
export {
  canViewUserProfile,
  requireViewUserProfileAccess,
  canEditUserProfile,
  requireEditUserProfileAccess,
  canDeleteUserProfile,
  requireDeleteUserProfileAccess,
  canManageUserRole,
  requireManageUserRoleAccess,
  canManageUserPermissions,
  requireManageUserPermissionsAccess,
  canActivateDeactivateUser,
  requireActivateDeactivateUserAccess,
  canEditUserMetadata,
  requireEditUserMetadataAccess,
  filterUserProfilesByAccess,
  getPublicProfileView,
} from './user_profiles/permissions';

// Queries
export {
  getUserProfile,
  getProfileByAuthId,
  getProfileByEmail,
  getAllProfiles,
  getProfileStats,
  searchUsers,
} from './user_profiles/queries';

// Mutations
export {
  createProfile,
  updateProfile,
  updateUserRole,
  updateActivity,
  deactivateUser,
  reactivateUser,
  syncProfileFromAuth,
  updateProfileMetadata,
  updateMetadataTags,
} from './user_profiles/mutations';
