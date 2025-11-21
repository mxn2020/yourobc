// convex/lib/software/yourobc/partners/index.ts
// Public API exports for partners module

// Constants
export { PARTNERS_CONSTANTS } from './constants';

// Types
export type * from './types';

// Utilities
export {
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
} from './mutations';
