// src/features/yourobc/partners/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'

// Base types from Convex schema
export type Partner = Doc<'yourobcPartners'>
export type PartnerId = Id<'yourobcPartners'>

// Re-export types from convex for consistency
export type {
  CreatePartnerData,
  UpdatePartnerData,
  ServiceCoverage,
} from '@/convex/lib/yourobc/partners/types'
export type {
  Address,
  Contact,
} from '@/convex/lib/yourobc/shared'

// Extended partner type with additional computed fields
export interface PartnerWithDetails extends Partner {
  displayName?: string
  contactInfo?: {
    name: string
    email?: string
    phone?: string
  }
  capabilities?: {
    canHandleOBC: boolean
    canHandleNFO: boolean
    primaryService: string
  }
  recentQuotes?: Array<{
    quoteId: Id<'yourobcQuotes'>
    quotedPrice: {
      amount: number
      currency: 'EUR' | 'USD'
    }
    receivedAt: number
    notes?: string
  }>
}

// UI-specific types
export interface PartnerFormData {
  companyName: string
  shortName?: string
  partnerCode?: string
  serviceType: 'OBC' | 'NFO' | 'both'
  primaryContact: {
    name: string
    email?: string
    phone?: string
    isPrimary: boolean
  }
  address: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }
  serviceCoverage: {
    countries: string[]
    cities: string[]
    airports: string[]
  }
  preferredCurrency?: 'EUR' | 'USD'
  paymentTerms?: number
  quotingEmail?: string
  notes?: string
  ranking?: number
  rankingNotes?: string
  internalPaymentNotes?: string
  serviceCapabilities?: {
    handlesCustoms?: boolean
    handlesPickup?: boolean
    handlesDelivery?: boolean
    handlesNFO?: boolean
    handlesTrucking?: boolean
  }
}

export interface PartnerListItem extends PartnerWithDetails {
  formattedLocation?: string
  coverageStats?: {
    countries: number
    cities: number
    airports: number
  }
  performanceScore?: number
  isPreferred?: boolean
  hasRecentActivity?: boolean
}

export interface PartnerDetailsProps {
  partner: PartnerWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export interface PartnerCardProps {
  partner: PartnerListItem
  onClick?: (partner: PartnerListItem) => void
  showCoverage?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface PartnerCreationParams {
  partnerData: PartnerFormData
  autoGenerateCode?: boolean
}

export interface PartnerUpdateParams {
  partnerId: PartnerId
  updates: Partial<PartnerFormData>
  updateReason?: string
}

export interface PartnerPerformanceMetrics {
  totalQuotes: number
  selectedQuotes: number
  selectionRate: number
  avgResponseTime: number
  avgQuoteAccuracy: number
  totalRevenue: number
  lastQuoteDate?: number
}

export interface PartnerInsights {
  performanceScore: number
  isNewPartner: boolean
  needsAttention: boolean
  isTopPerformer: boolean
  daysSinceLastQuote: number | null
  responsiveness: 'excellent' | 'good' | 'average' | 'poor'
}

// Stats type from query
export interface PartnerStats {
  totalPartners: number
  activePartners: number
  partnersByServiceType: Record<string, number>
  partnersByCountry: Record<string, number>
  avgQuotesPerPartner: number
}

// Coverage type from query
export interface PartnerCoverage {
  summary: {
    totalPartners: number
    countriesCount: number
    citiesCount: number
    airportsCount: number
  }
  coverage: {
    countries: Array<{
      country: string
      partnerCount: number
      partners: Array<{ id: PartnerId; name: string }>
    }>
    cities: Array<{
      city: string
      partnerCount: number
      partners: Array<{ id: PartnerId; name: string }>
    }>
    airports: Array<{
      airport: string
      partnerCount: number
      partners: Array<{ id: PartnerId; name: string }>
    }>
  }
}

// Filter and search types
export interface PartnerSearchFilters {
  status?: ('active' | 'inactive')[]
  serviceType?: ('OBC' | 'NFO' | 'both')[]
  countries?: string[]
  cities?: string[]
  airports?: string[]
  search?: string
}

export interface PartnerSortOptions {
  sortBy: 'companyName' | 'partnerCode' | 'serviceType' | 'status' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface PartnerDashboardMetrics {
  totalPartners: number
  activePartners: number
  obcPartners: number
  nfoPartners: number
  totalQuotes: number
  avgResponseTime: number
  topPerformingPartners: Array<{
    partnerId: PartnerId
    partnerName: string
    selectionRate: number
    totalQuotes: number
  }>
  recentActivity: Array<{
    partnerId: PartnerId
    partnerName: string
    activity: string
    timestamp: number
  }>
}

// Export constants
export const PARTNER_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active' as const,
    INACTIVE: 'inactive' as const,
  },
  SERVICE_TYPE: {
    OBC: 'OBC' as const,
    NFO: 'NFO' as const,
    BOTH: 'both' as const,
  },
  DEFAULT_VALUES: {
    STATUS: 'active' as const,
    PAYMENT_TERMS: 30,
    PREFERRED_CURRENCY: 'EUR' as const,
    TIMEZONE: 'Europe/Berlin',
  },
  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 100,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_PARTNER_CODE_LENGTH: 20,
    MAX_CONTACT_NAME_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_EMAIL_LENGTH: 100,
    MAX_NOTES_LENGTH: 1000,
    MAX_COUNTRIES: 50,
    MAX_CITIES: 100,
    MAX_AIRPORTS: 100,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
  },
  PERMISSIONS: {
    VIEW: 'partners.view',
    CREATE: 'partners.create',
    EDIT: 'partners.edit',
    DELETE: 'partners.delete',
    ASSIGN: 'partners.assign',
    VIEW_QUOTES: 'partners.view_quotes',
    MANAGE_COVERAGE: 'partners.manage_coverage',
  },
} as const

export const PARTNER_STATUS_COLORS = {
  [PARTNER_CONSTANTS.STATUS.ACTIVE]: '#10b981',
  [PARTNER_CONSTANTS.STATUS.INACTIVE]: '#6b7280',
} as const

export const SERVICE_TYPE_COLORS = {
  [PARTNER_CONSTANTS.SERVICE_TYPE.OBC]: '#3b82f6',
  [PARTNER_CONSTANTS.SERVICE_TYPE.NFO]: '#8b5cf6',
  [PARTNER_CONSTANTS.SERVICE_TYPE.BOTH]: '#10b981',
} as const

export const PARTNER_STATUS_LABELS = {
  [PARTNER_CONSTANTS.STATUS.ACTIVE]: 'Active',
  [PARTNER_CONSTANTS.STATUS.INACTIVE]: 'Inactive',
} as const

export const SERVICE_TYPE_LABELS = {
  [PARTNER_CONSTANTS.SERVICE_TYPE.OBC]: 'OBC Only',
  [PARTNER_CONSTANTS.SERVICE_TYPE.NFO]: 'NFO Only',
  [PARTNER_CONSTANTS.SERVICE_TYPE.BOTH]: 'OBC & NFO',
} as const

export const PAYMENT_TERMS_OPTIONS = [
  { value: 0, label: 'Immediate' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' },
  { value: 30, label: '30 days' },
  { value: 45, label: '45 days' },
  { value: 60, label: '60 days' },
  { value: 90, label: '90 days' },
] as const

// Common countries for selection
export const COMMON_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'PL', name: 'Poland' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AU', name: 'Australia' },
  { code: 'AE', name: 'UAE' },
] as const

// Common airports
export const COMMON_AIRPORTS = [
  'FRA', 'LHR', 'CDG', 'AMS', 'MAD',
  'FCO', 'MUC', 'ZUR', 'VIE', 'BRU',
  'JFK', 'LAX', 'ORD', 'YYZ', 'NRT',
  'SIN', 'SYD', 'DXB', 'DOH', 'HKG',
] as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
} as const