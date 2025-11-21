// src/features/yourobc/quotes/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { CourierId, InquirySourceId, QuoteId, CustomerId, Quote, Customer, PartnerId } from '@/convex/lib/yourobc'

// Re-export ID types for convenience
export type { CourierId, InquirySourceId, QuoteId, CustomerId, Quote, Customer }

// Re-export types from convex for consistency
export type {
  CreateQuoteData,
  UpdateQuoteData,
} from '@/convex/lib/yourobc/quotes/types'

// Extended quote type with additional computed fields
export interface QuoteWithDetails extends Quote {
  customer?: {
    _id: CustomerId
    companyName: string
    shortName?: string
    primaryContact: {
      name: string
      email?: string
      phone?: string
    }
  } | null
  assignedCourier?: {
    _id: Id<'yourobcCouriers'>
    courierNumber: string
    firstName: string
    lastName: string
    name?: string
    phone?: string
    status?: 'available' | 'busy' | 'offline'
  } | null
  inquirySource?: {
    _id: Id<'inquirySources'>
    name: string
    type: string
  } | null
  isExpiring?: boolean
  isOverdue?: boolean
  daysUntilExpiry?: number
  hasPartnerQuotes?: boolean
}

// UI-specific types
export interface QuoteFormData {
  customerReference?: string
  serviceType: 'OBC' | 'NFO'
  priority: 'standard' | 'urgent' | 'critical'
  customerId?: CustomerId
  inquirySourceId?: InquirySourceId
  origin: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }
  destination: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }
  dimensions: {
    length: number
    width: number
    height: number
    weight: number
    unit: 'cm' | 'inch'
    weightUnit: 'kg' | 'lb'
  }
  description: string
  specialInstructions?: string
  deadline: number
  assignedCourierId?: CourierId
  baseCost?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
  }
  markup?: number
  totalPrice?: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
  }
  validUntil: number
  quoteText?: string
  notes?: string
  // OBC-specific fields
  flightDetails?: {
    flightNumber?: string
    airline?: string
    departureTime?: number
    arrivalTime?: number
  }
  // NFO-specific fields
  partnerQuotes?: PartnerQuote[]
  selectedPartnerQuote?: PartnerId
}

export interface QuoteListItem extends QuoteWithDetails {
  displayName?: string
  formattedOrigin?: string
  formattedDestination?: string
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  profitMargin?: number
  daysToDeadline?: number
}

export interface QuoteDetailsProps {
  quote: QuoteWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
  onConvert?: () => void
  onSend?: () => void
}

export interface QuoteCardProps {
  quote: QuoteListItem
  onClick?: (quote: QuoteListItem) => void
  compact?: boolean
  showActions?: boolean
  showCustomer?: boolean
}

// Business logic types
export interface QuoteCreationParams {
  quoteData: QuoteFormData
  autoGenerateNumber?: boolean
  autoCalculatePrice?: boolean
}

export interface QuoteUpdateParams {
  quoteId: QuoteId
  updates: Partial<QuoteFormData>
  updateReason?: string
}

export interface QuoteConversionParams {
  quoteId: QuoteId
  shipmentData?: Partial<any> // Will be shipment form data
  createInvoice?: boolean
}

export interface QuotePricingCalculation {
  baseCost: number
  markup: number
  markupAmount: number
  totalPrice: number
  currency: 'EUR' | 'USD'
  profitMargin: number
}

export interface QuotePerformanceMetrics {
  totalQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  pendingQuotes: number
  conversionRate: number
  averageValue: number
  totalValue: number
}

export interface QuoteInsights {
  quoteAge: number
  daysUntilExpiry: number
  isExpiring: boolean
  isOverdue: boolean
  hasCompetitivePrice: boolean
  needsFollowUp: boolean
  conversionProbability: 'high' | 'medium' | 'low'
}

// Stats type from query (counts only)
export interface QuoteStats {
  totalQuotes: number
  pendingQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  expiredQuotes: number
  quotesByServiceType: Record<string, number>
  quotesByPriority: Record<string, number>
  quotesByStatus: Record<string, number>
  conversionRate: number
  averageQuoteValue: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  totalQuoteValue: {
    amount: number
    currency: 'EUR' | 'USD'
  }
  expiringQuotes: number
  overdueQuotes: number
}

// Filter and search types
export interface QuoteSearchFilters {
  status?: ('draft' | 'sent' | 'accepted' | 'rejected' | 'expired')[]
  serviceType?: ('OBC' | 'NFO')[]
  priority?: ('standard' | 'urgent' | 'critical')[]
  customerId?: CustomerId[]
  assignedCourierId?: CourierId[]
  inquirySourceId?: InquirySourceId[]
  originCountry?: string[]
  destinationCountry?: string[]
  dateRange?: {
    start: number
    end: number
    field: 'createdAt' | 'deadline' | 'validUntil' | 'sentAt'
  }
  priceRange?: {
    min: number
    max: number
    currency: 'EUR' | 'USD'
  }
  searchTerm?: string
  isExpiring?: boolean
  isOverdue?: boolean
}

export interface QuoteSortOptions {
  sortBy: 'quoteNumber' | 'customerName' | 'totalPrice' | 'deadline' | 'validUntil' | 'createdAt' | 'status'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types (includes both counts and detailed arrays)
export interface QuoteDashboardMetrics extends Omit<QuoteStats, 'expiringQuotes' | 'overdueQuotes'> {
  expiringQuotesCount: number
  overdueQuotesCount: number
  expiringQuotes: QuoteListItem[]
  overdueQuotes: QuoteListItem[]
  topCustomers: Array<{
    customerId: CustomerId
    customerName: string
    quoteCount: number
    totalValue: number
    conversionRate: number
  }>
  recentActivity: Array<{
    quoteId: QuoteId
    quoteNumber: string
    customerName: string
    activity: string
    timestamp: number
  }>
}

// Partner quote types
export interface PartnerQuote {
  partnerId: PartnerId
  partnerName: string
  quotedPrice: {
    amount: number
    currency: 'EUR' | 'USD'
    exchangeRate?: number
  }
  transitTime?: number
  validUntil?: number
  receivedAt: number
  notes?: string
  isSelected?: boolean
}

export interface PartnerQuoteComparison {
  ourQuote: QuotePricingCalculation
  partnerQuotes: PartnerQuote[]
  bestPartnerQuote?: PartnerQuote
  competitiveAdvantage: {
    priceAdvantage: number
    timeAdvantage?: number
    recommendations: string[]
  }
}

// Export constants
export const QUOTE_CONSTANTS = {
  STATUS: {
    DRAFT: 'draft' as const,
    SENT: 'sent' as const,
    ACCEPTED: 'accepted' as const,
    REJECTED: 'rejected' as const,
    EXPIRED: 'expired' as const,
  },
  SERVICE_TYPE: {
    OBC: 'OBC' as const,
    NFO: 'NFO' as const,
  },
  PRIORITY: {
    STANDARD: 'standard' as const,
    URGENT: 'urgent' as const,
    CRITICAL: 'critical' as const,
  },
  CURRENCY: {
    EUR: 'EUR' as const,
    USD: 'USD' as const,
  },
  DEFAULT_VALUES: {
    PRIORITY: 'standard' as const,
    CURRENCY: 'EUR' as const,
    MARKUP: 20,
    VALID_DAYS: 14,
    TIMEZONE: 'Europe/Berlin',
  },
  LIMITS: {
    MAX_QUOTE_NUMBER_LENGTH: 20,
    MAX_CUSTOMER_REFERENCE_LENGTH: 50,
    MAX_DESCRIPTION_LENGTH: 500,
    MAX_SPECIAL_INSTRUCTIONS_LENGTH: 1000,
    MAX_QUOTE_TEXT_LENGTH: 2000,
    MAX_NOTES_LENGTH: 2000,
    MAX_DIMENSIONS_VALUE: 10000,
    MIN_DIMENSIONS_VALUE: 0.1,
    MAX_WEIGHT: 1000,
    MIN_WEIGHT: 0.1,
    MIN_MARKUP: 0,
    MAX_MARKUP: 100,
  },
  PERMISSIONS: {
    VIEW: 'quotes.view',
    CREATE: 'quotes.create',
    EDIT: 'quotes.edit',
    DELETE: 'quotes.delete',
    SEND: 'quotes.send',
    ACCEPT: 'quotes.accept',
    REJECT: 'quotes.reject',
    CONVERT: 'quotes.convert',
    VIEW_PRICING: 'quotes.view_pricing',
    EDIT_PRICING: 'quotes.edit_pricing',
  },
} as const

export const QUOTE_STATUS_COLORS = {
  [QUOTE_CONSTANTS.STATUS.DRAFT]: '#6b7280',
  [QUOTE_CONSTANTS.STATUS.SENT]: '#3b82f6',
  [QUOTE_CONSTANTS.STATUS.ACCEPTED]: '#10b981',
  [QUOTE_CONSTANTS.STATUS.REJECTED]: '#ef4444',
  [QUOTE_CONSTANTS.STATUS.EXPIRED]: '#f59e0b',
} as const

export const QUOTE_STATUS_LABELS = {
  [QUOTE_CONSTANTS.STATUS.DRAFT]: 'Draft',
  [QUOTE_CONSTANTS.STATUS.SENT]: 'Sent',
  [QUOTE_CONSTANTS.STATUS.ACCEPTED]: 'Accepted',
  [QUOTE_CONSTANTS.STATUS.REJECTED]: 'Rejected',
  [QUOTE_CONSTANTS.STATUS.EXPIRED]: 'Expired',
} as const

export const SERVICE_TYPE_LABELS = {
  [QUOTE_CONSTANTS.SERVICE_TYPE.OBC]: 'On Board Courier',
  [QUOTE_CONSTANTS.SERVICE_TYPE.NFO]: 'Next Flight Out',
} as const

export const PRIORITY_LABELS = {
  [QUOTE_CONSTANTS.PRIORITY.STANDARD]: 'Standard',
  [QUOTE_CONSTANTS.PRIORITY.URGENT]: 'Urgent',
  [QUOTE_CONSTANTS.PRIORITY.CRITICAL]: 'Critical',
} as const

export const PRIORITY_COLORS = {
  [QUOTE_CONSTANTS.PRIORITY.STANDARD]: '#6b7280',
  [QUOTE_CONSTANTS.PRIORITY.URGENT]: '#f59e0b',
  [QUOTE_CONSTANTS.PRIORITY.CRITICAL]: '#ef4444',
} as const

// Common countries for selection
export const COMMON_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'United Arab Emirates' },
] as const

// Dimension units
export const DIMENSION_UNITS = [
  { value: 'cm', label: 'Centimeters' },
  { value: 'inch', label: 'Inches' },
] as const

export const WEIGHT_UNITS = [
  { value: 'kg', label: 'Kilograms' },
  { value: 'lb', label: 'Pounds' },
] as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
} as const