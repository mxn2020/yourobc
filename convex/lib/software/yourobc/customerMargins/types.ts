// convex/lib/software/yourobc/customerMargins/types.ts
/**
 * Customer Margins Library Types
 *
 * Additional types for business logic, calculations, and API responses.
 *
 * @module convex/lib/software/yourobc/customerMargins/types
 */

import { Id } from '../../../../_generated/dataModel'

// Re-export schema types for convenience
export * from '../../../schema/software/yourobc/customerMargins/types'

// ============================================================================
// Calculation Types
// ============================================================================

/**
 * Margin calculation result
 */
export interface MarginCalculation {
  cost: number
  marginPercentage: number
  minimumMarginEUR: number
  calculatedMarginFromPercentage: number
  calculatedMarginFromMinimum: number
  finalMargin: number
  finalPrice: number
  appliedRule: 'percentage' | 'minimum' | 'custom'
  ruleSource: 'route' | 'service' | 'volume' | 'default'
}

/**
 * Margin calculation input
 */
export interface MarginCalculationInput {
  customerId: Id<'yourobcCustomers'>
  cost: number
  serviceType?: string
  origin?: string
  destination?: string
  monthlyVolume?: number
}

// ============================================================================
// Analytics Types
// ============================================================================

/**
 * Customer risk assessment
 */
export interface CustomerRiskAssessment {
  customerId: Id<'yourobcCustomers'>
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  riskScore: number
  factors: {
    paymentBehavior: number
    overdueAmount: number
    dunningLevel: number
    contactFrequency: number
    complaintRate: number
  }
  recommendations: string[]
  calculatedAt: number
}

/**
 * Period analytics summary
 */
export interface PeriodAnalyticsSummary {
  period: {
    year: number
    month?: number
  }
  shipments: {
    total: number
    completed: number
    cancelled: number
    completionRate: number
  }
  financials: {
    revenue: number
    cost: number
    margin: number
    marginPercentage: number
  }
  payment: {
    invoiced: number
    paid: number
    outstanding: number
    averageDays: number
    onTimeRate: number
  }
  quality: {
    complaints: number
    resolutionRate: number
    satisfactionScore?: number
  }
}

/**
 * Analytics trend data
 */
export interface AnalyticsTrend {
  customerId: Id<'yourobcCustomers'>
  periods: PeriodAnalyticsSummary[]
  trends: {
    revenueGrowth: number
    marginTrend: number
    paymentBehaviorTrend: number
    volumeTrend: number
  }
}

// ============================================================================
// Dunning Types
// ============================================================================

/**
 * Dunning process status
 */
export interface DunningStatus {
  customerId: Id<'yourobcCustomers'>
  currentLevel: 0 | 1 | 2 | 3
  daysOverdue: number
  totalOverdue: number
  nextAction: {
    action: 'send_reminder' | 'escalate' | 'suspend' | 'legal_action'
    dueDate: number
    autoSend: boolean
  }
  history: DunningHistoryEntry[]
}

/**
 * Dunning history entry
 */
export interface DunningHistoryEntry {
  date: number
  level: 1 | 2 | 3
  action: string
  feeCharged: number
  invoiceId: Id<'yourobcInvoices'>
  sentBy: string
}

/**
 * Service suspension check result
 */
export interface ServiceSuspensionCheck {
  isSuspended: boolean
  canCreateOrders: boolean
  suspensionReason?: string
  suspendedDate?: number
  requiresPrepayment: boolean
  outstandingAmount?: number
  gracePeriodRemaining?: number
}

// ============================================================================
// Contact Types
// ============================================================================

/**
 * Follow-up task
 */
export interface FollowUpTask {
  contactLogId: Id<'contactLogTable'>
  customerId: Id<'yourobcCustomers'>
  subject: string
  dueDate: number
  priority: string
  assignedTo: string
  status: 'pending' | 'completed' | 'overdue'
  notes?: string
}

/**
 * Contact activity summary
 */
export interface ContactActivitySummary {
  customerId: Id<'yourobcCustomers'>
  totalContacts: number
  lastContactDate?: number
  daysSinceLastContact?: number
  contactsByType: Record<string, number>
  contactsByOutcome: Record<string, number>
  pendingFollowUps: number
  overdueFollowUps: number
}

// ============================================================================
// Query Filter Types
// ============================================================================

/**
 * Customer margins filter
 */
export interface CustomerMarginsFilter {
  customerId?: Id<'yourobcCustomers'>
  isActive?: boolean
  hasNegotiatedRates?: boolean
  needsReview?: boolean
  effectiveDateFrom?: number
  effectiveDateTo?: number
}

/**
 * Contact log filter
 */
export interface ContactLogFilter {
  customerId?: Id<'yourobcCustomers'>
  contactType?: string
  direction?: string
  outcome?: string
  requiresFollowUp?: boolean
  followUpAssignedTo?: string
  followUpCompleted?: boolean
  dateFrom?: number
  dateTo?: number
  category?: string
  priority?: string
}

/**
 * Analytics filter
 */
export interface AnalyticsFilter {
  customerId?: Id<'yourobcCustomers'>
  year?: number
  month?: number
  needsFollowUpAlert?: boolean
}

/**
 * Dunning config filter
 */
export interface DunningConfigFilter {
  customerId?: Id<'yourobcCustomers'>
  isActive?: boolean
  serviceSuspended?: boolean
  requiresPrepayment?: boolean
  skipDunningProcess?: boolean
}

// ============================================================================
// Pagination Types
// ============================================================================

/**
 * Paginated results
 */
export interface PaginatedResults<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  hasMore: boolean
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Operation result
 */
export interface OperationResult<T = void> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Batch operation result
 */
export interface BatchOperationResult<T = void> {
  success: boolean
  successCount: number
  failureCount: number
  results: OperationResult<T>[]
  errors: string[]
}

// ============================================================================
// Export All Types
// ============================================================================

export default {
  MarginCalculation,
  MarginCalculationInput,
  CustomerRiskAssessment,
  PeriodAnalyticsSummary,
  AnalyticsTrend,
  DunningStatus,
  DunningHistoryEntry,
  ServiceSuspensionCheck,
  FollowUpTask,
  ContactActivitySummary,
  CustomerMarginsFilter,
  ContactLogFilter,
  AnalyticsFilter,
  DunningConfigFilter,
  PaginatedResults,
  PaginationParams,
  OperationResult,
  BatchOperationResult,
}
