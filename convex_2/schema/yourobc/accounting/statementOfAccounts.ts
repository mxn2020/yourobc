// convex/schema/yourobc/accounting/statementOfAccounts.ts
/**
 * Statement of Accounts Table
 *
 * Per-customer account statements with transaction history.
 * Provides period-based financial summaries with opening/closing balances,
 * cached transaction details, and outstanding invoice tracking.
 *
 * @module convex/schema/yourobc/accounting/statementOfAccounts
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { currencyAmountSchema, auditFields, softDeleteFields } from '@/schema/base'
import { accountingValidators, accountingFields } from './validators'

/**
 * Statement of Accounts Table
 * Per-customer account statements with transaction history
 */
export const statementOfAccountsTable = defineTable({
  // Identity fields
  publicId: v.string(), // Unique public identifier (e.g., "SOA-2025-00001")
  ownerId: v.string(), // Organization owner

  // Customer reference
  customerId: v.id('yourobcCustomers'),

  // Period
  startDate: v.number(),
  endDate: v.number(),
  generatedDate: v.number(),

  // Summary
  openingBalance: currencyAmountSchema,
  totalInvoiced: currencyAmountSchema,
  totalPaid: currencyAmountSchema,
  closingBalance: currencyAmountSchema,

  // Transaction details (cached for performance)
  transactions: v.array(accountingFields.statementTransaction),

  // Outstanding invoices
  outstandingInvoices: v.array(v.object({
    ...accountingFields.outstandingInvoice.fields,
  })),

  // Export tracking
  exportedAt: v.optional(v.number()),
  exportedBy: v.optional(v.string()),
  exportFormat: v.optional(accountingValidators.exportFormat),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_ownerId_customer', ['ownerId', 'customerId'])
  .index('by_period', ['startDate', 'endDate'])
  .index('by_generatedDate', ['generatedDate'])
  .index('by_created', ['createdAt'])
  .index('by_deleted', ['deletedAt'])
