// convex/schema/system/user_profiles/user_profiles/types.ts
// Type extractions from validators for user profiles module

import { Infer } from 'convex/values';
import { userProfilesFields, userProfilesValidators } from './validators';

export type UserProfileRole = Infer<typeof userProfilesValidators.role>;
export type UserProfileStats = Infer<typeof userProfilesFields.stats>;
export type UserProfileExtendedMetadata = Infer<typeof userProfilesFields.extendedMetadata>;
