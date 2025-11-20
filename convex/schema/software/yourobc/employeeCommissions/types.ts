// convex/schema/software/yourobc/employeeCommissions/types.ts
/**
 * Employee Commissions Type Exports
 *
 * Extracts types from validators for use in the codebase.
 * This is the single source of truth for commission-related types.
 *
 * @module convex/schema/software/yourobc/employeeCommissions/types
 */

import { Infer } from 'convex/values'
import { Doc, Id } from '../../../../_generated/dataModel'
import {
  appliedTierValidator,
  commissionTierValidator,
  serviceTypeValidator,
} from './validators'

// ============================================================================
// Validator Types
// ============================================================================

/**
 * Applied Tier Type
 * Represents the tier that was applied to a commission calculation
 */
export type AppliedTier = Infer<typeof appliedTierValidator>

/**
 * Commission Tier Type
 * Represents a tier in a commission rule's tier structure
 */
export type CommissionTier = Infer<typeof commissionTierValidator>

/**
 * Service Type
 * Type of service for commission rule filtering
 */
export type ServiceType = Infer<typeof serviceTypeValidator>

// ============================================================================
// Document Types
// ============================================================================

/**
 * Employee Commission Document
 */
export type EmployeeCommission = Doc<'yourobcEmployeeCommissions'>

/**
 * Employee Commission Rule Document
 */
export type EmployeeCommissionRule = Doc<'yourobcEmployeeCommissionRules'>

// ============================================================================
// ID Types
// ============================================================================

/**
 * Employee Commission ID
 */
export type EmployeeCommissionId = Id<'yourobcEmployeeCommissions'>

/**
 * Employee Commission Rule ID
 */
export type EmployeeCommissionRuleId = Id<'yourobcEmployeeCommissionRules'>

// ============================================================================
// Input Types for Mutations
// ============================================================================

/**
 * Create Employee Commission Input
 */
export type CreateEmployeeCommissionInput = {
  employeeId: Id<'yourobcEmployees'>
  shipmentId?: Id<'yourobcShipments'>
  quoteId?: Id<'yourobcQuotes'>
  invoiceId?: Id<'yourobcInvoices'>
  type: string
  ruleId?: Id<'yourobcEmployeeCommissionRules'>
  ruleName?: string
  baseAmount: number
  margin?: number
  marginPercentage?: number
  commissionRate: number
  commissionAmount: number
  currency: string
  appliedTier?: AppliedTier
  calculatedAt?: number
  status: string
  invoicePaymentStatus?: string
  invoicePaidDate?: number
  period: string
  description?: string
  notes?: string
}

/**
 * Update Employee Commission Input
 */
export type UpdateEmployeeCommissionInput = {
  type?: string
  baseAmount?: number
  margin?: number
  marginPercentage?: number
  commissionRate?: number
  commissionAmount?: number
  currency?: string
  status?: string
  invoicePaymentStatus?: string
  invoicePaidDate?: number
  paidDate?: number
  paymentReference?: string
  paymentMethod?: string
  paidBy?: string
  approvedBy?: string
  approvedDate?: number
  approvalNotes?: string
  cancelledBy?: string
  cancelledDate?: number
  cancellationReason?: string
  period?: string
  description?: string
  notes?: string
  paymentNotes?: string
}

/**
 * Create Employee Commission Rule Input
 */
export type CreateEmployeeCommissionRuleInput = {
  employeeId: Id<'yourobcEmployees'>
  name: string
  description?: string
  type: string
  rate?: number
  tiers?: CommissionTier[]
  serviceTypes?: ServiceType[]
  applicableCategories?: string[]
  applicableProducts?: Id<'products'>[]
  minMarginPercentage?: number
  minOrderValue?: number
  minCommissionAmount?: number
  autoApprove?: boolean
  priority?: number
  startDate?: number
  endDate?: number
  effectiveFrom: number
  effectiveTo?: number
  isActive: boolean
  notes?: string
}

/**
 * Update Employee Commission Rule Input
 */
export type UpdateEmployeeCommissionRuleInput = {
  name?: string
  description?: string
  type?: string
  rate?: number
  tiers?: CommissionTier[]
  serviceTypes?: ServiceType[]
  applicableCategories?: string[]
  applicableProducts?: Id<'products'>[]
  minMarginPercentage?: number
  minOrderValue?: number
  minCommissionAmount?: number
  autoApprove?: boolean
  priority?: number
  startDate?: number
  endDate?: number
  effectiveFrom?: number
  effectiveTo?: number
  isActive?: boolean
  notes?: string
}
