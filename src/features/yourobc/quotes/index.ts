// src/features/yourobc/quotes/index.ts

// === Types ===
export type {
  QuoteFormData,
  QuoteListItem,
  QuoteDetailsProps,
  QuoteCardProps,
  QuoteCreationParams,
  QuoteUpdateParams,
  QuoteConversionParams,
  QuotePricingCalculation,
  QuotePerformanceMetrics,
  QuoteSearchFilters,
  QuoteSortOptions,
  QuoteDashboardMetrics,
  QuoteWithDetails,
  QuoteInsights,
  PartnerQuote,
  PartnerQuoteComparison,
  CreateQuoteData,
  UpdateQuoteData,
} from './types'

export {
  QUOTE_CONSTANTS,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  COMMON_COUNTRIES,
  DIMENSION_UNITS,
  WEIGHT_UNITS,
  CURRENCY_SYMBOLS,
} from './types'

// === Services ===
export { QuotesService, quotesService } from './services/QuotesService'

// === Hooks ===
export {
  useQuotes,
  useQuote,
  useQuoteSearch,
  useExpiringQuotes,
  useQuoteForm,
} from './hooks/useQuotes'

// === Components ===
export { QuoteCard } from './components/QuoteCard'
export { QuoteList } from './components/QuoteList'
export { QuoteForm } from './components/QuoteForm'
export { QuoteStats } from './components/QuoteStats'
export { QuoteSearch } from './components/QuoteSearch'

// === Pages ===
export { QuotesPage } from './pages/QuotesPage'
export { QuoteDetailsPage } from './pages/QuoteDetailsPage'
export { CreateQuotePage } from './pages/CreateQuotePage'

// === Utils ===
export const QuoteUtils = {
  formatQuoteNumber: (quote: { quoteNumber: string }) => quote.quoteNumber,
  
  formatCurrency: (amount: number, currency: 'EUR' | 'USD' = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  },

  formatAddress: (address: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }) => {
    const parts = [address.street, address.city, address.country].filter(Boolean)
    return parts.join(', ')
  },

  formatDimensions: (dimensions: {
    length: number
    width: number
    height: number
    weight: number
    unit: 'cm' | 'inch'
    weightUnit: 'kg' | 'lb'
  }) => {
    const { length, width, height, weight, unit, weightUnit } = dimensions
    return `${length}×${width}×${height} ${unit}, ${weight} ${weightUnit}`
  },

  calculateDaysUntilExpiry: (validUntil: number) => {
    return Math.ceil((validUntil - Date.now()) / (24 * 60 * 60 * 1000))
  },

  calculateQuoteAge: (createdAt: number) => {
    return Math.floor((Date.now() - createdAt) / (24 * 60 * 60 * 1000))
  },

  isQuoteExpiring: (validUntil: number, warningDays = 3) => {
    const daysUntilExpiry = Math.ceil((validUntil - Date.now()) / (24 * 60 * 60 * 1000))
    return daysUntilExpiry <= warningDays && daysUntilExpiry > 0
  },

  isQuoteOverdue: (validUntil: number) => {
    return Date.now() > validUntil
  },

  canConvertToShipment: (status: string) => {
    return status === 'accepted'
  },

  canSendQuote: (status: string) => {
    return status === 'draft'
  },

  canEditQuote: (status: string) => {
    return ['draft', 'sent'].includes(status)
  },

  getQuoteStatusColor: (status: string) => {
    const colors = {
      draft: '#6b7280',
      sent: '#3b82f6',
      accepted: '#10b981',
      rejected: '#ef4444',
      expired: '#f59e0b',
    }
    return colors[status as keyof typeof colors] || '#6b7280'
  },

  getPriorityColor: (priority: string) => {
    const colors = {
      standard: '#6b7280',
      urgent: '#f59e0b',
      critical: '#ef4444',
    }
    return colors[priority as keyof typeof colors] || '#6b7280'
  },

  calculateProfitMargin: (totalPrice: number, baseCost: number) => {
    if (totalPrice <= 0) return 0
    return Math.round(((totalPrice - baseCost) / totalPrice) * 100)
  },

  generateQuoteText: (quote: {
    serviceType: 'OBC' | 'NFO'
    origin: { city: string; country: string }
    destination: { city: string; country: string }
    description: string
    totalPrice?: { amount: number; currency: string }
    deadline: number
    validUntil: number
  }) => {
    const serviceLabel = quote.serviceType === 'OBC' ? 'On Board Courier' : 'Next Flight Out'
    const formattedPrice = quote.totalPrice 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: quote.totalPrice.currency,
        }).format(quote.totalPrice.amount)
      : 'Price on request'
    
    const deadlineDate = new Date(quote.deadline).toLocaleDateString()
    const validDate = new Date(quote.validUntil).toLocaleDateString()

    return `Dear Valued Customer,

Thank you for your inquiry regarding ${serviceLabel} service from ${quote.origin.city}, ${quote.origin.country} to ${quote.destination.city}, ${quote.destination.country}.

Service Details:
- Item: ${quote.description}
- Service Type: ${serviceLabel}
- Route: ${quote.origin.city} → ${quote.destination.city}
- Delivery Deadline: ${deadlineDate}

Quote Details:
- Total Price: ${formattedPrice}
- Quote Valid Until: ${validDate}

This quote includes all necessary arrangements for secure and timely delivery of your shipment. Our experienced team ensures professional handling throughout the entire transport process.

Please let us know if you have any questions or if you would like to proceed with this shipment.

Best regards,
Your Logistics Team`
  },
}