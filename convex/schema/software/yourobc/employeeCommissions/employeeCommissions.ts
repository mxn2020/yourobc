// convex/schema/software/yourobc/employeeCommissions/employeeCommissions.ts
/**
 * Employee Commissions Table Schema
 *
 * Tracks sales employee commissions (separate from courier commissions).
 * Links to shipments, quotes, and invoices with full approval and payment workflow.
 *
 * @module convex/schema/software/yourobc/employeeCommissions/employeeCommissions
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  employeeCommissionTypeValidator,
  commissionStatusValidator,
  invoicePaymentStatusValidator,
  currencyValidator,
  auditFields,
  softDeleteFields,
  metadataSchema,
  paymentMethodValidator,
} from '../../base'
import { appliedTierValidator } from './validators'

/**
 * Employee Commissions Table
 * Tracks sales employee earnings with approval and payment workflow
 */
export const employeeCommissionsTable = defineTable({
  // Core Identity
  publicId: v.string(), // Public-facing unique identifier
  ownerId: v.string(), // Auth user ID who owns this commission

  // References
  employeeId: v.id('yourobcEmployees'),
  shipmentId: v.optional(v.id('yourobcShipments')), // optional for non-shipment commissions
  quoteId: v.optional(v.id('yourobcQuotes')),
  invoiceId: v.optional(v.id('yourobcInvoices')),

  // Commission Configuration
  type: employeeCommissionTypeValidator,
  ruleId: v.optional(v.id('yourobcEmployeeCommissionRules')),
  ruleName: v.optional(v.string()),

  // Financial Details
  baseAmount: v.number(), // Revenue or margin amount
  margin: v.optional(v.number()), // Profit margin (revenue - costs)
  marginPercentage: v.optional(v.number()), // margin / revenue * 100
  commissionRate: v.number(), // Percentage or fixed amount
  commissionAmount: v.number(), // Final commission amount
  currency: currencyValidator,

  // Applied Rules
  appliedTier: v.optional(appliedTierValidator),
  calculatedAt: v.optional(v.number()),

  // Status & Payment
  status: commissionStatusValidator,
  invoicePaymentStatus: v.optional(invoicePaymentStatusValidator),
  invoicePaidDate: v.optional(v.number()), // When invoice was paid

  // Payment Details
  paidDate: v.optional(v.number()),
  paymentReference: v.optional(v.string()),
  paymentMethod: v.optional(paymentMethodValidator),
  paidBy: v.optional(v.string()), // authUserId who paid

  // Approval Workflow
  approvedBy: v.optional(v.string()), // authUserId
  approvedDate: v.optional(v.number()),
  approvalNotes: v.optional(v.string()),

  // Cancellation
  cancelledBy: v.optional(v.string()), // authUserId who cancelled
  cancelledDate: v.optional(v.number()),
  cancellationReason: v.optional(v.string()),

  // Display Field
  period: v.string(), // e.g., "2024-01" for display and grouping

  // Additional Information
  description: v.optional(v.string()),
  notes: v.optional(v.string()),
  paymentNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_employee', ['employeeId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_quote', ['quoteId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_rule', ['ruleId'])
  .index('by_status', ['status'])
  .index('by_employee_status', ['employeeId', 'status'])
  .index('by_employee_period', ['employeeId', 'period'])
  .index('by_period', ['period'])
  .index('by_invoicePaymentStatus', ['invoicePaymentStatus'])
  .index('by_approval_pending', ['status', 'invoicePaidDate']) // For auto-approval when invoice paid
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
  .searchIndex('search_period', {
    searchField: 'period',
    filterFields: ['ownerId', 'employeeId', 'status', 'deletedAt'],
  })
