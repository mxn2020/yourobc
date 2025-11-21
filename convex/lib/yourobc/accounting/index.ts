// convex/lib/yourobc/accounting/index.ts
// Public API exports for accounting module

// Constants
export { ACCOUNTING_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
  validateAccountingEntryData,
  formatAccountingEntryDisplayName,
  generateJournalEntryNumber,
  isAccountingEntryEditable,
  calculateFiscalPeriod,
  calculateFiscalYear,
  isEntryBalanced,
} from './utils';

// Permissions
export {
  canViewAccountingEntry,
  canEditAccountingEntry,
  canDeleteAccountingEntry,
  canApproveAccountingEntry,
  requireViewAccountingEntryAccess,
  requireEditAccountingEntryAccess,
  requireDeleteAccountingEntryAccess,
  requireApproveAccountingEntryAccess,
  filterAccountingEntriesByAccess,
} from './permissions';

// Queries
export {
  getAccountingEntries,
  getAccountingEntry,
  getAccountingEntryByPublicId,
  getAccountingEntryByJournalEntryNumber,
  getAccountingStats,
} from './queries';

// Mutations
export {
  createAccountingEntry,
  updateAccountingEntry,
  deleteAccountingEntry,
  restoreAccountingEntry,
  approveAccountingEntry,
} from './mutations';
