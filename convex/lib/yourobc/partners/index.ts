// convex/lib/yourobc/partners/index.ts
// convex/yourobc/partners/index.ts

export { 
  PARTNER_CONSTANTS, 
  PARTNER_STATUS_COLORS, 
  SERVICE_TYPE_COLORS,
  COMMON_AIRPORTS,
  PAYMENT_TERM_OPTIONS
} from './constants'

export * from './types'

export {
  getPartners,
  getPartner,
  getAvailablePartners,
  getPartnerStats,
  searchPartners,
  getPartnerQuotes,
  getPartnerCoverage,
} from './queries'

export {
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerCoverage,
  togglePartnerStatus,
} from './mutations'

export {
  validatePartnerData,
  validateServiceCoverage,
  generatePartnerCode,
  getPartnerStatusColor,
  getServiceTypeColor,
  isPartnerAvailableForRoute,
  isPartnerAvailableForCity,
  isPartnerAvailableForAirport,
  formatPartnerDisplayName,
  getPartnerContactInfo,
  sanitizePartnerForExport,
  calculatePartnerPerformanceScore,
  getPartnerServiceCapabilities,
} from './utils'