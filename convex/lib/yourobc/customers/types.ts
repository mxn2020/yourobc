// convex/lib/yourobc/customers/types.ts
/**
 * Customer Type Definitions
 *
 * Comprehensive type definitions for the customer module.
 * These types are used throughout the customer management system.
 *
 * @module convex/lib/yourobc/customers/types
 */

import type { Doc, Id } from '../../../_generated/dataModel'
import { CustomerStatus, PaymentMethod } from '../../../schema/yourobc'
import type { Address, Contact } from '../shared'

// ============================================================================
// CORE TYPES
// ============================================================================

/**
 * Customer document type
 */
export type Customer = Doc<'yourobcCustomers'>

/**
 * Customer ID type
 */
export type CustomerId = Id<'yourobcCustomers'>

// ============================================================================
// STATISTICS & METRICS
// ============================================================================

/**
 * Customer statistics
 * Tracks key metrics for customer performance
 */
export interface CustomerStats {
  totalQuotes: number
  acceptedQuotes: number
  rejectedQuotes: number
  totalRevenue: number
  totalMargin: number
  averageMargin: number
  totalShipments: number
  lastQuoteDate?: number
  lastShipmentDate?: number
  lastInvoiceDate?: number
}

/**
 * Customer score components
 */
export interface CustomerScoreComponents {
  revenueScore: number
  activityScore: number
  paymentScore: number
  longevityScore: number
  totalScore: number
}

/**
 * Customer risk level
 */
export type CustomerRiskLevel = 'low' | 'medium' | 'high'

// ============================================================================
// DATA TRANSFER OBJECTS (DTOs)
// ============================================================================

/**
 * Data required to create a new customer
 */
export interface CreateCustomerData {
  // Core Information (Required)
  companyName: string
  primaryContact: Contact
  billingAddress: Address

  // Core Information (Optional)
  shortName?: string
  website?: string

  // Additional Contacts
  additionalContacts?: Contact[]

  // Addresses
  shippingAddress?: Address

  // Financial Settings
  defaultCurrency?: 'EUR' | 'USD'
  paymentTerms?: number
  paymentMethod?: PaymentMethod
  margin?: number

  // Classification
  inquirySourceId?: Id<'yourobcInquirySources'>
  tags?: string[]

  // Notes
  notes?: string
  internalNotes?: string
}

/**
 * Data allowed for updating a customer
 * All fields are optional
 */
export interface UpdateCustomerData {
  // Core Information
  companyName?: string
  shortName?: string
  website?: string

  // Status
  status?: CustomerStatus

  // Contacts
  primaryContact?: Contact
  additionalContacts?: Contact[]

  // Addresses
  billingAddress?: Address
  shippingAddress?: Address

  // Financial Settings
  defaultCurrency?: 'EUR' | 'USD'
  paymentTerms?: number
  paymentMethod?: PaymentMethod
  margin?: number

  // Classification
  inquirySourceId?: Id<'yourobcInquirySources'>
  tags?: string[]

  // Notes
  notes?: string
  internalNotes?: string
}

/**
 * Margin configuration for advanced margin rules
 */
export interface MarginConfiguration {
  type: 'percentage' | 'fixed' | 'hybrid'
  percentage?: number
  minimumAmount?: number
  currency?: 'EUR' | 'USD'
}

// ============================================================================
// QUERY PARAMETERS
// ============================================================================

/**
 * Filters for customer queries
 */
export interface CustomerFilters {
  status?: CustomerStatus[]
  countries?: string[]
  currencies?: ('EUR' | 'USD')[]
  paymentMethods?: string[]
  inquirySources?: Id<'yourobcInquirySources'>[]
  tags?: string[]
  search?: string
  hasRecentActivity?: boolean
  minRevenue?: number
  maxRevenue?: number
  minPaymentTerms?: number
  maxPaymentTerms?: number
}

/**
 * Options for customer list queries
 */
export interface CustomerListOptions {
  limit?: number
  offset?: number
  sortBy?: 'companyName' | 'totalRevenue' | 'lastQuoteDate' | 'createdAt' | 'updatedAt' | 'paymentTerms' | 'margin'
  sortOrder?: 'asc' | 'desc'
  filters?: CustomerFilters
}

/**
 * Result from customer list queries
 */
export interface CustomerListResult {
  customers: CustomerWithDetails[]
  total: number
  hasMore: boolean
}

// ============================================================================
// ENHANCED CUSTOMER TYPES
// ============================================================================

/**
 * Customer with inquiry source details
 */
export interface CustomerWithInquirySource extends Customer {
  inquirySource?: {
    name: string
    type: string
    description?: string
  } | null
}

/**
 * Customer with calculated scores and details
 */
export interface CustomerWithDetails extends CustomerWithInquirySource {
  score: number
  riskLevel: CustomerRiskLevel
  isActive: boolean
}

/**
 * Customer with recent activity summary
 */
export interface CustomerWithActivity extends CustomerWithDetails {
  recentActivity: {
    quotes: number
    shipments: number
    outstandingInvoices: number
    outstandingAmount: number
  }
}

// ============================================================================
// AGGREGATE STATISTICS
// ============================================================================

/**
 * Aggregate statistics across all customers
 */
export interface CustomerAggregateStats {
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

/**
 * Top customer ranking entry
 */
export interface TopCustomerEntry extends CustomerWithDetails {
  rank: number
  score: number
  riskLevel: CustomerRiskLevel
}

/**
 * Customer tag with usage count
 */
export interface CustomerTag {
  tag: string
  count: number
}

// ============================================================================
// ACTIVITY TRACKING
// ============================================================================

/**
 * Customer activity type
 */
export type CustomerActivityType = 'quote' | 'shipment' | 'invoice' | 'contact' | 'note'

/**
 * Customer activity entry
 */
export interface CustomerActivity {
  id: string
  type: CustomerActivityType
  createdAt: number
  data: any
  description: string
}

/**
 * Customer activity summary
 */
export interface CustomerActivitySummary {
  activities: CustomerActivity[]
  summary: {
    totalQuotes: number
    totalShipments: number
    totalInvoices: number
  }
}

// ============================================================================
// CONTACT PROTOCOL
// ============================================================================

/**
 * Contact log entry
 */
export interface ContactLogEntry {
  _id: Id<'yourobcContactLog'>
  customerId: Id<'yourobcCustomers'>
  contactedBy: string
  contactDate: number
  contactChannel: 'email' | 'phone' | 'whatsapp' | 'meeting' | 'other'
  subject: string
  notes?: string
  nextFollowUp?: number
  createdAt: number
  createdBy: string
}

/**
 * Follow-up reminder
 */
export interface FollowUpReminder {
  _id: Id<'yourobcFollowupReminders'>
  customerId: Id<'yourobcCustomers'>
  dueDate: number
  assignedTo: string
  subject: string
  notes?: string
  status: 'pending' | 'completed' | 'cancelled'
  createdAt: number
  completedAt?: number
}

// ============================================================================
// ANALYTICS
// ============================================================================

/**
 * Customer lifetime value analysis
 */
export interface CustomerLifetimeValue {
  customerId: Id<'yourobcCustomers'>
  totalRevenue: number
  totalMargin: number
  averageOrderValue: number
  orderFrequency: number
  customerLifespanDays: number
  projectedLifetimeValue: number
}

/**
 * Customer payment behavior
 */
export interface CustomerPaymentBehavior {
  customerId: Id<'yourobcCustomers'>
  averagePaymentDelay: number
  onTimePaymentRate: number
  latePaymentCount: number
  totalInvoices: number
  outstandingAmount: number
  creditRating: CustomerRiskLevel
}

/**
 * Customer analytics snapshot
 */
export interface CustomerAnalytics {
  _id: Id<'yourobcCustomerAnalytics'>
  customerId: Id<'yourobcCustomers'>
  calculatedAt: number
  lifetimeValue: CustomerLifetimeValue
  paymentBehavior: CustomerPaymentBehavior
  topRoutes: Array<{
    origin: string
    destination: string
    count: number
    revenue: number
  }>
  topServices: Array<{
    service: string
    count: number
    revenue: number
  }>
}

// ============================================================================
// DUNNING CONFIGURATION
// ============================================================================

/**
 * Dunning level
 */
export type DunningLevel = 1 | 2 | 3

/**
 * Customer dunning configuration
 */
export interface CustomerDunningConfig {
  _id: Id<'yourobcCustomerDunningConfig'>
  customerId: Id<'yourobcCustomers'>
  enabled: boolean
  firstReminderDays: number
  secondReminderDays: number
  thirdReminderDays: number
  firstReminderFee: number
  secondReminderFee: number
  thirdReminderFee: number
  currency: 'EUR' | 'USD'
  autoSuspendService: boolean
  suspendAtLevel: DunningLevel
  createdAt: number
  updatedAt: number
}

// ============================================================================
// MARGIN CONFIGURATION
// ============================================================================

/**
 * Customer margin rule
 */
export interface CustomerMargin {
  _id: Id<'yourobcCustomerMargins'>
  customerId: Id<'yourobcCustomers'>
  ruleType: 'default' | 'service' | 'route' | 'volume'
  marginType: 'percentage' | 'fixed' | 'hybrid'
  percentage?: number
  minimumAmount?: number
  currency?: 'EUR' | 'USD'
  service?: string
  originCountry?: string
  destinationCountry?: string
  minVolume?: number
  maxVolume?: number
  priority: number
  isActive: boolean
  createdAt: number
  updatedAt: number
}

// ============================================================================
// EXPORT FORMATS
// ============================================================================

/**
 * Customer export data (sanitized for external use)
 */
export interface CustomerExportData {
  companyName: string
  shortName?: string
  status: CustomerStatus
  primaryContactName: string
  primaryContactEmail?: string
  primaryContactPhone?: string
  billingCountry: string
  billingCity: string
  shippingCountry?: string
  shippingCity?: string
  defaultCurrency: 'EUR' | 'USD'
  paymentTerms: number
  paymentMethod: string
  margin: number
  totalRevenue: number
  totalQuotes: number
  acceptedQuotes: number
  tags: string[]
  createdAt: number
  lastQuoteDate?: number
  lastShipmentDate?: number
}

