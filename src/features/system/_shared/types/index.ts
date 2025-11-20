// filepath: src/features/system/_shared/types/index.ts
/**
 * Shared types used across system features
 */

export type {
  AuthUserId,
  UserProfileId,
  AnyUserId,
} from "./id-types";

export {
  isAuthUserId,
  isUserProfileId,
  validateAuthUserId,
  validateUserProfileId,
  getIdType,
} from "./id-types";
