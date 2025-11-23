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

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, currencyAmountSchema, softDeleteFields } from '@/schema/base';
import { accountingFields, accountingValidators } from './validators';

/**
 * Statement of Accounts Table
 * Per-customer account statements with transaction history
 */
export const statementOfAccountsTable = defineTable({
  // Required: Main display field
  publicId: v.string(),

  // Required: Core fields
  ownerId: v.id('userProfiles'),

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
  outstandingInvoices: v.array(accountingFields.outstandingInvoice),

  // Export tracking
  exportedAt: v.optional(v.number()),
  exportedBy: v.optional(v.id('userProfiles')),
  exportFormat: v.optional(accountingValidators.exportFormat),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_customer', ['customerId'])
  .index('by_owner_customer', ['ownerId', 'customerId'])
  .index('by_period', ['startDate', 'endDate'])
  .index('by_generated_date', ['generatedDate'])
  .index('by_created_at', ['createdAt'])
  .index('by_deleted_at', ['deletedAt']);
