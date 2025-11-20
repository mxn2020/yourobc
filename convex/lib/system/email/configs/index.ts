// convex/lib/boilerplate/email/configs/index.ts
// Public API exports for email configs module

// Constants
export { EMAIL_CONFIGS_CONSTANTS, EMAIL_PROVIDER_NAMES } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmailConfigData,
  isValidEmail,
  formatEmailConfigDisplayName,
  getProviderDisplayName,
  isEmailConfigEditable,
  sanitizeEmailConfig,
} from './utils';

// Permissions
export {
  canViewEmailConfig,
  canEditEmailConfig,
  canDeleteEmailConfig,
  canCreateEmailConfig,
  requireViewEmailConfigAccess,
  requireEditEmailConfigAccess,
  requireDeleteEmailConfigAccess,
  requireCreateEmailConfigAccess,
  filterEmailConfigsByAccess,
} from './permissions';

// Queries
export {
  getActiveConfig,
  getEmailConfigs,
  getEmailConfig,
  getEmailConfigByPublicId,
  getConfigByProvider,
  getEmailConfigStats,
} from './queries';

// Mutations
export {
  saveEmailConfig,
  updateEmailConfig,
  setActiveConfig,
  updateTestStatus,
  deleteEmailConfig,
  restoreEmailConfig,
} from './mutations';
