// filepath: src/features/boilerplate/_shared/types/index.ts
/**
 * Shared types used across boilerplate features
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
