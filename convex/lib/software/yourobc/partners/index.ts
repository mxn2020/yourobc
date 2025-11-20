// convex/lib/software/yourobc/partners/index.ts
// Public API exports for partners module

// Constants
export {
  PARTNERS_CONSTANTS,
  PARTNER_STATUS_LABELS,
  PARTNER_SERVICE_TYPE_LABELS,
  CURRENCY_LABELS,
  RANKING_LABELS,
  SERVICE_CAPABILITIES_LABELS,
} from './constants';

// Types
export type * from './types';

// Utilities
export {
  validatePartnerData,
  validatePartnerUpdateData,
  generatePartnerCode,
  getPartnerDisplayName,
  getPartnerStatusLabel,
  getServiceTypeLabel,
  getRankingLabel,
  isPartnerActive,
  canHandleServiceType,
  coversCountry,
  coversCity,
  coversAirport,
  getServiceCapabilitiesSummary,
  formatRating,
  formatPaymentTerms,
  generateSearchKeywords,
} from './utils';

// Permissions
export {
  canViewPartner,
  canViewInternalNotes,
  canCreatePartner,
  canEditPartner,
  canDeletePartner,
  canRestorePartner,
  canPermanentlyDeletePartner,
  canChangePartnerStatus,
  canTransferPartnerOwnership,
  requireViewAccess,
  requireEditAccess,
  requireDeleteAccess,
  requireAdminAccess,
  requireSuperAdminAccess,
} from './permissions';

// Queries
export {
  getPartner,
  getPartnerByPublicId,
  getPartnerByCompanyName,
  listPartners,
  listPartnersByOwner,
  listActivePartners,
  searchPartnersByLocation,
  getPartnersCountByStatus,
  getTopRatedPartners,
  partnerExistsByCompanyName,
} from './queries';

// Mutations
export {
  createPartner,
  updatePartner,
  deletePartner,
  restorePartner,
  changePartnerStatus,
  updatePartnerRanking,
  transferPartnerOwnership,
  bulkUpdatePartnerStatus,
  bulkDeletePartners,
} from './mutations';
