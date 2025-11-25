// convex/lib/system/email/email_logs/index.ts
// Public API exports for email logs module

// Constants
export { EMAIL_LOGS_CONSTANTS, EMAIL_LOGS_VALUES } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateEmailLogData,
  isValidDeliveryStatus,
  truncatePreview,
  trimEmailAddresses,
  formatEmailLogDisplayName,
  getDeliveryStatusColor,
  formatEmailLogForDisplay,
} from './utils';

// Permissions
export {
  canViewEmailLog,
  requireViewEmailLogAccess,
  canManageEmailLogs,
  requireManageEmailLogsAccess,
  filterEmailLogsByAccess,
  canDeleteEmailLog,
  requireDeleteEmailLogAccess,
} from './permissions';

// Queries
export {
  getEmailLogs,
  getEmailLogByMessageId,
  getEmailLogById,
  getEmailStats,
} from './queries';

// Mutations
export {
  logEmail,
  updateEmailStatus,
  deleteEmailLog,
} from './mutations';
