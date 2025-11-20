// convex/lib/software/yourobc/employeeCommissions/types.ts
/**
 * Employee Commissions Library Types
 *
 * Additional types for employee commission operations beyond schema types.
 *
 * @module convex/lib/software/yourobc/employeeCommissions/types
 */

import { Id } from '../../../../_generated/dataModel'

// Re-export schema types
export type {
  AppliedTier,
  CommissionTier,
  ServiceType,
  EmployeeCommission,
  EmployeeCommissionRule,
  EmployeeCommissionId,
  EmployeeCommissionRuleId,
  CreateEmployeeCommissionInput,
  UpdateEmployeeCommissionInput,
  CreateEmployeeCommissionRuleInput,
  UpdateEmployeeCommissionRuleInput,
} from '../../../schema/software/yourobc/employeeCommissions/types'

/**
 * Commission calculation context
 */
export type CommissionCalculationContext = {
  employeeId: Id<'yourobcEmployees'>
  shipmentId?: Id<'yourobcShipments'>
  quoteId?: Id<'yourobcQuotes'>
  invoiceId?: Id<'yourobcInvoices'>
  revenue: number
  costs: number
  margin: number
  marginPercentage: number
  currency: string
  serviceType?: string
  category?: string
  productId?: Id<'products'>
}

/**
 * Commission calculation result
 */
export type CommissionCalculationResult = {
  type: string
  ruleId?: Id<'yourobcEmployeeCommissionRules'>
  ruleName?: string
  baseAmount: number
  margin: number
  marginPercentage: number
  commissionRate: number
  commissionAmount: number
  appliedTier?: {
    minAmount: number
    maxAmount?: number
    rate: number
    description?: string
  }
  calculatedAt: number
}

/**
 * Commission totals by period
 */
export type CommissionTotalsByPeriod = {
  period: string
  totalCommissions: number
  totalPaid: number
  totalPending: number
  totalApproved: number
  count: number
  currency: string
}

/**
 * Commission totals by employee
 */
export type CommissionTotalsByEmployee = {
  employeeId: Id<'yourobcEmployees'>
  employeeName: string
  totalCommissions: number
  totalPaid: number
  totalPending: number
  totalApproved: number
  count: number
  currency: string
}

/**
 * Rule match result
 */
export type RuleMatchResult = {
  ruleId: Id<'yourobcEmployeeCommissionRules'>
  ruleName: string
  type: string
  priority: number
  rate?: number
  tiers?: Array<{
    minAmount: number
    maxAmount?: number
    rate: number
    description?: string
  }>
  autoApprove?: boolean
}

/**
 * Commission approval input
 */
export type ApproveCommissionInput = {
  commissionId: Id<'yourobcEmployeeCommissions'>
  approvedBy: string
  approvalNotes?: string
}

/**
 * Commission payment input
 */
export type PayCommissionInput = {
  commissionId: Id<'yourobcEmployeeCommissions'>
  paidBy: string
  paymentDate: number
  paymentReference?: string
  paymentMethod: string
  paymentNotes?: string
}

/**
 * Commission cancellation input
 */
export type CancelCommissionInput = {
  commissionId: Id<'yourobcEmployeeCommissions'>
  cancelledBy: string
  cancellationReason: string
}

/**
 * Batch commission calculation input
 */
export type BatchCalculateCommissionsInput = {
  employeeId: Id<'yourobcEmployees'>
  period: string
  invoiceIds: Id<'yourobcInvoices'>[]
}

/**
 * Commission search filters
 */
export type CommissionSearchFilters = {
  employeeId?: Id<'yourobcEmployees'>
  status?: string
  period?: string
  startDate?: number
  endDate?: number
  minAmount?: number
  maxAmount?: number
}

/**
 * Rule search filters
 */
export type RuleSearchFilters = {
  employeeId?: Id<'yourobcEmployees'>
  isActive?: boolean
  type?: string
  effectiveDate?: number
}
