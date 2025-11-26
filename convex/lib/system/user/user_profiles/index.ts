// convex/lib/system/user_profiles/user_profiles/index.ts
// Public API exports for user_profiles module

// Constants
export { USER_PROFILES_CONSTANTS } from './constants';

// Types
export type * from './types';

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
} from './utils';

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
} from './permissions';

// Queries
export {
  getUserProfile,
  getProfileByAuthId,
  getProfileByEmail,
  getAllProfiles,
  getProfileStats,
  searchUsers,
} from './queries';

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
} from './mutations';

// Recovery utilities
export {
  recoverMissingProfile,
  batchRecoverProfiles,
  findMissingProfiles,
  profileSyncHealthCheck,
} from './recovery';
