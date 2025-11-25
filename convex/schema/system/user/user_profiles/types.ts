// convex/schema/system/user_profiles/user_profiles/types.ts
// Type extractions from validators for user profiles module

import { type Infer } from 'convex/values';
import type { Doc, Id } from '@/generated/dataModel';
import { userProfilesFields, userProfilesValidators } from './validators';
import { userProfilesTable } from './tables';

// ============================================
// Document Types
// ============================================

export type UserProfile = Doc<'userProfiles'>;
export type UserProfileId = Id<'userProfiles'>;

// ============================================
// Schema Type (from table validator)
// ============================================

export type UserProfileSchema = Infer<typeof userProfilesTable.validator>;

// ============================================
// Validator Types
// ============================================

export type UserProfileRole = Infer<typeof userProfilesValidators.role>;

// ============================================
// Field Types
// ============================================

export type UserProfileStats = Infer<typeof userProfilesFields.stats>;
export type UserProfileExtendedMetadata = Infer<typeof userProfilesFields.extendedMetadata>;
