// src/features/yourobc/customers/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { PaymentMethod } from '@/convex/schema/yourobc'

// Base types from Convex schema
export type Customer = Doc<'yourobcCustomers'>
export type CustomerId = Id<'yourobcCustomers'>
export type InquirySource = Doc<'yourobcInquirySources'>
export type InquirySourceId = Id<'yourobcInquirySources'>

// Re-export types from convex for consistency
export type {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerStats as CustomerStatsType,
} from '@/convex/lib/yourobc/customers/types'

// Extended customer type with additional computed fields
export interface CustomerWithDetails extends Customer {
  inquirySource?: {
    name: string
    type: string
    description?: string
  } | null
  score?: number
  riskLevel?: 'low' | 'medium' | 'high'
  isActive?: boolean
  recentActivity?: {
    quotes: number
    shipments: number
    outstandingInvoices: number
    outstandingAmount: number
  }
}

// UI-specific types
export interface CustomerFormData {
  companyName: string
  shortName?: string
  primaryContact: {
    name: string
    email?: string
    phone?: string
    isPrimary: boolean
  }
  additionalContacts?: Array<{
    name: string
    email?: string
    phone?: string
    isPrimary: boolean
  }>
  billingAddress: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }
  shippingAddress?: {
    street?: string
    city: string
    postalCode?: string
    country: string
    countryCode: string
  }
  defaultCurrency?: 'EUR' | 'USD'
  paymentTerms?: number
  paymentMethod?: PaymentMethod
  margin?: number
  inquirySourceId?: Id<'yourobcInquirySources'>
  tags?: string[]
  notes?: string
  internalNotes?: string
  website?: string
}

export interface CustomerListItem extends CustomerWithDetails {
  displayName?: string
  formattedBillingAddress?: string
  formattedShippingAddress?: string
  hasRecentActivity?: boolean
  lastContactDate?: number
  totalValue?: number
}

export interface CustomerDetailsProps {
  customer: CustomerWithDetails
  showActions?: boolean
  onEdit?: () => void
  onDelete?: () => void
}

export interface CustomerCardProps {
  customer: CustomerListItem
  onClick?: (customer: CustomerListItem) => void
  showContactInfo?: boolean
  compact?: boolean
  showActions?: boolean
}

// Business logic types
export interface CustomerCreationParams {
  customerData: CustomerFormData
  autoAssignNumber?: boolean
  sendWelcomeEmail?: boolean
}

export interface CustomerUpdateParams {
  customerId: CustomerId
  updates: Partial<CustomerFormData>
  updateReason?: string
}

export interface CustomerPerformanceMetrics {
  totalQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  totalRevenue: number
  totalShipments: number
  averageOrderValue: number
  lastOrderDate?: number
  customerLifetime: number
}

export interface CustomerInsights {
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  customerAge: number
  daysSinceLastOrder: number | null
  needsAttention: boolean
  isNewCustomer: boolean
  isTopCustomer: boolean
  potentialValue: number
}

// Stats type from query
export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  blacklistedCustomers: number
  customersByCountry: Record<string, number>
  customersByCurrency: Record<string, number>
  averagePaymentTerms: number
  totalRevenue: number
  newCustomersThisMonth: number
}

// Filter and search types
export interface CustomerSearchFilters {
  status?: ('active' | 'inactive' | 'blacklisted')[]
  countries?: string[]
  currencies?: ('EUR' | 'USD')[]
  paymentMethods?: string[]
  inquirySources?: Id<'yourobcInquirySources'>[]
  tags?: string[]
  search?: string
  hasRecentActivity?: boolean
}

export interface CustomerSortOptions {
  sortBy: 'companyName' | 'totalRevenue' | 'lastQuoteDate' | 'createdAt'
  sortOrder: 'asc' | 'desc'
}

// Dashboard types
export interface CustomerDashboardMetrics {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  totalRevenue: number
  averageOrderValue: number
  topCustomers: Array<{
    customerId: CustomerId
    companyName: string
    totalRevenue: number
    totalOrders: number
  }>
  recentActivity: Array<{
    customerId: CustomerId
    customerName: string
    activity: string
    timestamp: number
  }>
}

// Export constants
export const CUSTOMER_CONSTANTS = {
  STATUS: {
    ACTIVE: 'active' as const,
    INACTIVE: 'inactive' as const,
    BLACKLISTED: 'blacklisted' as const,
  },
  CONTACT_TYPE: {
    PRIMARY: 'primary' as const,
    SECONDARY: 'secondary' as const,
    BILLING: 'billing' as const,
    SHIPPING: 'shipping' as const,
  },
  DEFAULT_VALUES: {
    STATUS: 'active' as const,
    CURRENCY: 'EUR' as const,
    PAYMENT_TERMS: 30,
    PAYMENT_METHOD: 'bank_transfer' as const,
    MARGIN: 0,
  },
  LIMITS: {
    MAX_COMPANY_NAME_LENGTH: 200,
    MAX_SHORT_NAME_LENGTH: 50,
    MAX_CONTACT_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 100,
    MAX_PHONE_LENGTH: 20,
    MAX_WEBSITE_LENGTH: 200,
    MAX_NOTES_LENGTH: 5000,
    MAX_TAGS: 20,
    MAX_CONTACTS: 10,
    MIN_PAYMENT_TERMS: 0,
    MAX_PAYMENT_TERMS: 365,
    MIN_MARGIN: -100,
    MAX_MARGIN: 1000,
  },
  PERMISSIONS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    EDIT: 'customers.edit',
    DELETE: 'customers.delete',
    VIEW_STATS: 'customers.view_stats',
    EXPORT: 'customers.export',
  },
} as const

export const CUSTOMER_STATUS_COLORS = {
  [CUSTOMER_CONSTANTS.STATUS.ACTIVE]: '#10b981',
  [CUSTOMER_CONSTANTS.STATUS.INACTIVE]: '#f59e0b',
  [CUSTOMER_CONSTANTS.STATUS.BLACKLISTED]: '#ef4444',
} as const

export const CUSTOMER_STATUS_LABELS = {
  [CUSTOMER_CONSTANTS.STATUS.ACTIVE]: 'Active',
  [CUSTOMER_CONSTANTS.STATUS.INACTIVE]: 'Inactive',
  [CUSTOMER_CONSTANTS.STATUS.BLACKLISTED]: 'Blacklisted',
} as const

export const PAYMENT_METHODS = [
  'bank_transfer',
  'credit_card',
  'cash',
  'check',
  'paypal',
  'wire_transfer',
] as const

export const PAYMENT_METHOD_LABELS = {
  bank_transfer: 'Bank Transfer',
  credit_card: 'Credit Card',
  cash: 'Cash',
  check: 'Check',
  paypal: 'PayPal',
  wire_transfer: 'Wire Transfer',
} as const

export const COMMON_CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'JPY',
  'CAD',
  'AUD',
  'CHF',
  'CNY',
] as const

export const CURRENCY_LABELS = {
  EUR: 'Euro (€)',
  USD: 'US Dollar ($)',
  GBP: 'British Pound (£)',
  JPY: 'Japanese Yen (¥)',
  CAD: 'Canadian Dollar (C$)',
  AUD: 'Australian Dollar (A$)',
  CHF: 'Swiss Franc (CHF)',
  CNY: 'Chinese Yuan (¥)',
} as const

export const COMMON_PAYMENT_TERMS = [
  { label: 'Net 15', value: 15 },
  { label: 'Net 30', value: 30 },
  { label: 'Net 45', value: 45 },
  { label: 'Net 60', value: 60 },
  { label: 'Due on Receipt', value: 0 },
  { label: 'Cash in Advance', value: -1 },
] as const

export const COMMON_COUNTRIES = [
  { code: 'DE', name: 'Germany' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'FR', name: 'France' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
] as const

// Currency symbols
export const CURRENCY_SYMBOLS = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
} as const