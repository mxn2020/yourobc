// convex/schema/software/yourobc/customerMargins/types.ts
/**
 * Customer Margins Module Type Exports
 *
 * Type extractions from validators and schemas for all 4 tables:
 * - Customer Margins
 * - Contact Log
 * - Customer Analytics
 * - Customer Dunning Config
 *
 * @module convex/schema/software/yourobc/customerMargins/types
 */

import { Infer } from 'convex/values'
import { Doc, Id } from '../../../../_generated/dataModel'
import {
  serviceMarginValidator,
  routeMarginValidator,
  volumeTierValidator,
  serviceAnalyticsValidator,
  marginsByServiceValidator,
  topRouteValidator,
  customerMarginsBaseValidator,
  contactLogBaseValidator,
  customerAnalyticsBaseValidator,
  customerDunningConfigBaseValidator,
} from './validators'

// ============================================================================
// Document Types (from database)
// ============================================================================

/**
 * Customer Margins document from database
 */
export type CustomerMargins = Doc<'customerMarginsTable'>

/**
 * Contact Log document from database
 */
export type ContactLog = Doc<'contactLogTable'>

/**
 * Customer Analytics document from database
 */
export type CustomerAnalytics = Doc<'customerAnalyticsTable'>

/**
 * Customer Dunning Config document from database
 */
export type CustomerDunningConfig = Doc<'customerDunningConfigTable'>

// ============================================================================
// ID Types
// ============================================================================

/**
 * Customer Margins ID type
 */
export type CustomerMarginsId = Id<'customerMarginsTable'>

/**
 * Contact Log ID type
 */
export type ContactLogId = Id<'contactLogTable'>

/**
 * Customer Analytics ID type
 */
export type CustomerAnalyticsId = Id<'customerAnalyticsTable'>

/**
 * Customer Dunning Config ID type
 */
export type CustomerDunningConfigId = Id<'customerDunningConfigTable'>

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Service margin configuration
 */
export type ServiceMargin = Infer<typeof serviceMarginValidator>

/**
 * Route margin configuration
 */
export type RouteMargin = Infer<typeof routeMarginValidator>

/**
 * Volume tier configuration
 */
export type VolumeTier = Infer<typeof volumeTierValidator>

/**
 * Service analytics data
 */
export type ServiceAnalytics = Infer<typeof serviceAnalyticsValidator>

/**
 * Margins by service type
 */
export type MarginsByService = Infer<typeof marginsByServiceValidator>

/**
 * Top route analytics
 */
export type TopRoute = Infer<typeof topRouteValidator>

// ============================================================================
// Base Input Types (for creating/updating)
// ============================================================================

/**
 * Base input for creating customer margins
 */
export type CustomerMarginsBaseInput = Infer<typeof customerMarginsBaseValidator>

/**
 * Base input for creating contact log
 */
export type ContactLogBaseInput = Infer<typeof contactLogBaseValidator>

/**
 * Base input for creating customer analytics
 */
export type CustomerAnalyticsBaseInput = Infer<typeof customerAnalyticsBaseValidator>

/**
 * Base input for creating customer dunning config
 */
export type CustomerDunningConfigBaseInput = Infer<typeof customerDunningConfigBaseValidator>

// ============================================================================
// Extended Input Types
// ============================================================================

/**
 * Complete input for creating customer margins
 */
export interface CreateCustomerMarginsInput extends CustomerMarginsBaseInput {
  serviceMargins?: ServiceMargin[]
  routeMargins?: RouteMargin[]
  volumeTiers?: VolumeTier[]
  negotiatedRatesNotes?: string
  negotiatedRatesValidUntil?: number
  calculationMethod?: string
  customCalculationNotes?: string
  expiryDate?: number
  lastReviewDate?: number
  nextReviewDate?: number
  lastModifiedBy?: string
  notes?: string
  internalNotes?: string
}

/**
 * Input for updating customer margins
 */
export interface UpdateCustomerMarginsInput {
  id: CustomerMarginsId
  defaultMarginPercentage?: number
  defaultMinimumMarginEUR?: number
  serviceMargins?: ServiceMargin[]
  routeMargins?: RouteMargin[]
  volumeTiers?: VolumeTier[]
  hasNegotiatedRates?: boolean
  negotiatedRatesNotes?: string
  negotiatedRatesValidUntil?: number
  calculationMethod?: string
  customCalculationNotes?: string
  isActive?: boolean
  effectiveDate?: number
  expiryDate?: number
  lastReviewDate?: number
  nextReviewDate?: number
  lastModifiedBy?: string
  notes?: string
  internalNotes?: string
}

/**
 * Complete input for creating contact log
 */
export interface CreateContactLogInput extends ContactLogBaseInput {
  contactPersonId?: Id<'contactPersons'>
  details?: string
  outcome?: string
  outcomeNotes?: string
  relatedQuoteId?: Id<'yourobcQuotes'>
  relatedShipmentId?: Id<'yourobcShipments'>
  relatedInvoiceId?: Id<'yourobcInvoices'>
  followUpDate?: number
  followUpAssignedTo?: string
  followUpCompleted?: boolean
  followUpCompletedDate?: number
  followUpCompletedBy?: string
  followUpNotes?: string
  duration?: number
  category?: string
  priority?: string
}

/**
 * Input for updating contact log
 */
export interface UpdateContactLogInput {
  id: ContactLogId
  subject?: string
  summary?: string
  details?: string
  outcome?: string
  outcomeNotes?: string
  requiresFollowUp?: boolean
  followUpDate?: number
  followUpAssignedTo?: string
  followUpCompleted?: boolean
  followUpCompletedDate?: number
  followUpCompletedBy?: string
  followUpNotes?: string
  category?: string
  priority?: string
}

/**
 * Complete input for creating customer analytics
 */
export interface CreateCustomerAnalyticsInput extends CustomerAnalyticsBaseInput {
  month?: number
  completedShipments: number
  cancelledShipments: number
  averageMargin: number
  averageMarginPercentage: number
  marginsByService?: MarginsByService
  topRoutes?: TopRoute[]
  totalInvoiced: number
  totalPaid: number
  totalOutstanding: number
  averagePaymentDays: number
  onTimePaymentRate: number
  latePaymentCount: number
  overdueInvoiceCount: number
  dunningLevel1Count: number
  dunningLevel2Count: number
  dunningLevel3Count: number
  totalDunningFees: number
  totalContacts: number
  lastContactDate?: number
  daysSinceLastContact?: number
  needsFollowUpAlert: boolean
  complaintCount: number
  issueResolutionRate: number
  customerSatisfactionScore?: number
}

/**
 * Complete input for creating customer dunning config
 */
export interface CreateCustomerDunningConfigInput extends CustomerDunningConfigBaseInput {
  level1EmailTemplate?: string
  level2EmailTemplate?: string
  level3EmailTemplate?: string
  level3SuspendService: boolean
  allowServiceWhenOverdue: boolean
  suspensionGracePeriodDays?: number
  autoReactivateOnPayment: boolean
  skipDunningProcess: boolean
  customPaymentTermsDays?: number
  requirePrepayment: boolean
  dunningContactEmail?: string
  dunningContactPhone?: string
  dunningContactName?: string
  preferredDunningMethod?: string
  serviceSuspended?: boolean
  serviceSuspendedDate?: number
  serviceSuspendedBy?: string
  serviceReactivatedDate?: number
  serviceReactivatedBy?: string
  serviceSuspensionReason?: string
  lastModifiedBy?: string
  notes?: string
  internalNotes?: string
}

/**
 * Input for updating customer dunning config
 */
export interface UpdateCustomerDunningConfigInput {
  id: CustomerDunningConfigId
  level1DaysOverdue?: number
  level1FeeEUR?: number
  level1EmailTemplate?: string
  level1AutoSend?: boolean
  level2DaysOverdue?: number
  level2FeeEUR?: number
  level2EmailTemplate?: string
  level2AutoSend?: boolean
  level3DaysOverdue?: number
  level3FeeEUR?: number
  level3EmailTemplate?: string
  level3AutoSend?: boolean
  level3SuspendService?: boolean
  allowServiceWhenOverdue?: boolean
  suspensionGracePeriodDays?: number
  autoReactivateOnPayment?: boolean
  skipDunningProcess?: boolean
  customPaymentTermsDays?: number
  requirePrepayment?: boolean
  dunningContactEmail?: string
  dunningContactPhone?: string
  dunningContactName?: string
  preferredDunningMethod?: string
  serviceSuspended?: boolean
  serviceSuspendedDate?: number
  serviceSuspendedBy?: string
  serviceReactivatedDate?: number
  serviceReactivatedBy?: string
  serviceSuspensionReason?: string
  lastModifiedBy?: string
  isActive?: boolean
  notes?: string
  internalNotes?: string
}

// ============================================================================
// Export all types
// ============================================================================

export default {
  // Document types
  CustomerMargins,
  ContactLog,
  CustomerAnalytics,
  CustomerDunningConfig,

  // ID types
  CustomerMarginsId,
  ContactLogId,
  CustomerAnalyticsId,
  CustomerDunningConfigId,

  // Validator types
  ServiceMargin,
  RouteMargin,
  VolumeTier,
  ServiceAnalytics,
  MarginsByService,
  TopRoute,

  // Input types
  CreateCustomerMarginsInput,
  UpdateCustomerMarginsInput,
  CreateContactLogInput,
  UpdateContactLogInput,
  CreateCustomerAnalyticsInput,
  CreateCustomerDunningConfigInput,
  UpdateCustomerDunningConfigInput,
}
