// convex/schema/boilerplate/user_profiles/user_profiles/types.ts
// Type extractions from validators for user_profiles module

import { Infer } from 'convex/values';
import { userProfilesValidators } from './validators';

// Extract types from validators
export type UserRole = Infer<typeof userProfilesValidators.role>;
export type UserStats = Infer<typeof userProfilesValidators.userStats>;
export type UserProfileExtendedMetadata = Infer<typeof userProfilesValidators.extendedMetadata>;
