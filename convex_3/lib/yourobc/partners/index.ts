// convex/lib/yourobc/partners/index.ts
// Public API exports for partners module

// Constants
export { PARTNERS_CONSTANTS, PARTNERS_VALUES } from './constants';

// Types
export type * from './types';

// Utilities
export {
  trimPartnerData,
  validatePartnerData,
  formatPartnerDisplayName,
  isPartnerEditable,
} from './utils';

// Permissions
export {
  canViewPartner,
  canEditPartner,
  canDeletePartner,
  requireViewPartnerAccess,
  requireEditPartnerAccess,
  requireDeletePartnerAccess,
  filterPartnersByAccess,
} from './permissions';

// Queries
export {
  getPartners,
  getPartner,
  getPartnerByPublicId,
  getPartnerStats,
} from './queries';

// Mutations
export {
  createPartner,
  updatePartner,
  deletePartner,
  restorePartner,
  archivePartner,
  bulkUpdatePartners,
  bulkDeletePartners,
} from './mutations';
