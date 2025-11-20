// src/features/yourobc/partners/index.ts

// === Configuration ===
export {
  PARTNERS_CONFIG,
  PARTNERS_MODULE_CONFIG,
  DEFAULT_PARTNERS_CONFIG,
  MINIMAL_PARTNERS_CONFIG,
  getPartnersConfig,
  isFeatureEnabled,
  checkFeature,
  isCoreModuleEnabled,
  getLimit,
  getDisplayOption,
  hasAdvancedFeatures,
  type PartnersConfig,
} from './config/partners.config'

// === Types ===
export type {
  Partner,
  PartnerId,
  PartnerFormData,
  PartnerListItem,
  PartnerDetailsProps,
  PartnerCardProps,
  PartnerCreationParams,
  PartnerUpdateParams,
  PartnerPerformanceMetrics,
  PartnerSearchFilters,
  PartnerSortOptions,
  PartnerDashboardMetrics,
  PartnerWithDetails,
  PartnerInsights,
  PartnerCoverage,
  CreatePartnerData,
  UpdatePartnerData,
  Address,
  Contact,
  ServiceCoverage,
} from './types'

export {
  PARTNER_CONSTANTS,
  PARTNER_STATUS_COLORS,
  SERVICE_TYPE_COLORS,
  PARTNER_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  PAYMENT_TERMS_OPTIONS,
  COMMON_COUNTRIES,
  COMMON_AIRPORTS,
  CURRENCY_SYMBOLS,
} from './types'

// === Services ===
export { PartnersService, partnersService } from './services/PartnersService'

// === Hooks ===
export {
  usePartners,
  usePartner,
  useAvailablePartners,
  usePartnerSearch,
  usePartnerQuotes,
  usePartnerCoverage,
  usePartnerForm,
} from './hooks/usePartners'

// === Components ===
export { PartnerCard } from './components/PartnerCard'
export { PartnerList } from './components/PartnerList'
export { PartnerForm } from './components/PartnerForm'
export { PartnerStats } from './components/PartnerStats'
export { PartnerSearch } from './components/PartnerSearch'

// === Pages ===
export { PartnersPage } from './pages/PartnersPage'
export { PartnerDetailsPage } from './pages/PartnerDetailsPage'
export { CreatePartnerPage } from './pages/CreatePartnerPage'
export { PartnerCoveragePage } from './pages/PartnerCoveragePage'