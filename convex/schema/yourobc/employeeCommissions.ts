// convex/schema/yourobc/employeeCommissions.ts
/**
 * YourOBC Employee Commissions Schema
 *
 * Defines schemas for employee commission tracking and rules.
 * Separate from courier commissions - tracks sales employee earnings.
 * Follows the single source of truth pattern using validators from base.ts.
 *
 * @module convex/schema/yourobc/employeeCommissions
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
} from './base'

// ============================================================================
// Employee Commissions Table
// ============================================================================

/**
 * Employee Commissions (Sales Staff)
 * Separate from courier commissions - tracks sales employee earnings
 */
export const employeeCommissionsTable = defineTable({
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
  appliedTier: v.optional(v.object({
    minAmount: v.number(),
    maxAmount: v.optional(v.number()),
    rate: v.number(),
    description: v.optional(v.string()),
  })),
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

  // Additional Information
  description: v.optional(v.string()),
  notes: v.optional(v.string()),
  paymentNotes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_employee', ['employeeId'])
  .index('by_shipment', ['shipmentId'])
  .index('by_quote', ['quoteId'])
  .index('by_invoice', ['invoiceId'])
  .index('by_rule', ['ruleId'])
  .index('by_status', ['status'])
  .index('by_employee_status', ['employeeId', 'status'])
  .index('by_employee_period', ['employeeId', 'createdAt'])
  .index('by_invoicePaymentStatus', ['invoicePaymentStatus'])
  .index('by_approval_pending', ['status', 'invoicePaidDate']) // For auto-approval when invoice paid
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])

// ============================================================================
// Employee Commission Rules Table
// ============================================================================

/**
 * Employee Commission Rules
 * Configurable commission rules per employee with tiering and filters
 */
export const employeeCommissionRulesTable = defineTable({
  employeeId: v.id('yourobcEmployees'),
  name: v.string(),
  description: v.optional(v.string()),

  // Rule Configuration
  type: employeeCommissionTypeValidator,

  // Rate Configuration
  rate: v.optional(v.number()), // for percentage and fixed amount types
  tiers: v.optional(v.array(v.object({
    minAmount: v.number(),
    maxAmount: v.optional(v.number()),
    rate: v.number(),
    description: v.optional(v.string()),
  }))), // for tiered type

  // Service Type Filter (optional)
  serviceTypes: v.optional(v.array(v.union(v.literal('OBC'), v.literal('NFO')))),
  applicableCategories: v.optional(v.array(v.string())),
  applicableProducts: v.optional(v.array(v.id('products'))),

  // Minimum Thresholds
  minMarginPercentage: v.optional(v.number()), // Only pay if margin > x%
  minOrderValue: v.optional(v.number()), // Only pay if order > x
  minCommissionAmount: v.optional(v.number()), // Minimum payout amount

  // Automation Settings
  autoApprove: v.optional(v.boolean()), // Auto-approve when invoice is paid
  priority: v.optional(v.number()), // Rule priority when multiple rules apply

  // Effective Period
  startDate: v.optional(v.number()),
  endDate: v.optional(v.number()),
  effectiveFrom: v.number(),
  effectiveTo: v.optional(v.number()),

  // Status
  isActive: v.boolean(),

  // Notes
  notes: v.optional(v.string()),

  // Metadata and audit fields
  ...metadataSchema,
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_employee', ['employeeId'])
  .index('by_employee_active', ['employeeId', 'isActive'])
  .index('by_isActive', ['isActive'])
  .index('by_effectiveFrom', ['effectiveFrom'])
  .index('by_created', ['createdAt'])

// ============================================================================
// USAGE NOTES
// ============================================================================

/**
 * Schema design follows the single source of truth pattern.
 *
 * ✅ DO:
 * - Import validators from base.ts (employeeCommissionTypeValidator, commissionStatusValidator, etc.)
 * - Import reusable schemas from base.ts (auditFields, metadataSchema, currencyValidator, etc.)
 * - Use imported validators in table definitions
 * - Add indexes for frequently queried fields
 * - Use spread operator for metadata/audit fields: ...metadataSchema, ...auditFields, ...softDeleteFields
 *
 * ❌ DON'T:
 * - Define inline v.union() validators in table definitions
 * - Duplicate validator definitions across tables
 * - Forget to add indexes for query patterns
 * - Redefine audit or metadata fields manually
 *
 * CUSTOMIZATION GUIDE:
 *
 * 1. Employee Commissions Table:
 *    - Tracks sales employee commissions (separate from courier commissions)
 *    - Links to shipments, quotes, and invoices
 *    - Supports multiple commission types and calculation methods
 *    - Full approval and payment workflow
 *
 * 2. Commission Types (from employeeCommissionTypeValidator):
 *    - margin_percentage: Commission based on profit margin percentage
 *    - revenue_percentage: Commission based on total revenue percentage
 *    - fixed_amount: Fixed commission amount per transaction
 *    - tiered: Commission rate varies based on amount tiers
 *
 * 3. Financial Tracking:
 *    - baseAmount: Revenue or margin amount (basis for calculation)
 *    - margin: Actual profit margin (revenue - costs)
 *    - marginPercentage: margin / revenue * 100
 *    - commissionRate: Percentage or fixed amount to apply
 *    - commissionAmount: Final calculated commission
 *    - currency: EUR or USD (uses currencyValidator)
 *
 * 4. Commission Calculation:
 *    - Links to commission rules via ruleId
 *    - appliedTier: Specific tier used for tiered commissions
 *    - calculatedAt: Timestamp of calculation for audit
 *
 * 5. Status Workflow (from commissionStatusValidator):
 *    - pending: Commission created, awaiting approval
 *    - approved: Approved for payment
 *    - paid: Payment completed
 *    - cancelled: Commission cancelled (with reason)
 *
 * 6. Payment Dependencies:
 *    - invoicePaymentStatus: Tracks if customer invoice is paid
 *    - invoicePaidDate: When customer paid the invoice
 *    - Auto-approval: Can auto-approve when invoice is paid
 *
 * 7. Payment Tracking:
 *    - paidDate: When employee was paid
 *    - paymentReference: Bank transfer reference, check number, etc.
 *    - paymentMethod: Uses employeePaymentMethodValidator
 *    - paidBy: AuthUserId who processed payment
 *
 * 8. Commission Rules Table:
 *    - Per-employee configurable commission rules
 *    - Supports all commission types
 *    - Simple rate for percentage/fixed types
 *    - Tiers array for tiered type
 *    - Service/category/product filters
 *    - Minimum thresholds (margin %, order value, commission amount)
 *
 * 9. Rule Filtering:
 *    - serviceTypes: Apply only to specific services (OBC, NFO)
 *    - applicableCategories: Product/service categories
 *    - applicableProducts: Specific product IDs
 *    - minMarginPercentage: Only pay if margin exceeds threshold
 *    - minOrderValue: Minimum order value requirement
 *    - minCommissionAmount: Minimum payout threshold
 *
 * 10. Rule Priority & Automation:
 *     - priority: When multiple rules match, highest priority wins
 *     - autoApprove: Auto-approve commissions when invoice is paid
 *     - effectiveFrom/effectiveTo: Time-based rule validity
 *     - isActive: Enable/disable rules without deletion
 *
 * 11. Indexes:
 *     - by_employee: All commissions for an employee
 *     - by_employee_status: Employee's commissions by status
 *     - by_employee_period: Time-based commission queries
 *     - by_status: All commissions by status (for admin)
 *     - by_invoicePaymentStatus: Track commissions awaiting invoice payment
 *     - by_approval_pending: Auto-approval queries when invoice paid
 */
