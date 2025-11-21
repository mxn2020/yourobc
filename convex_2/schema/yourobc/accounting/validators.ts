// convex/schema/yourobc/accounting/validators.ts
/**
 * Accounting Validators
 *
 * Convex validators for accounting-related data structures.
 * Includes status enums and reusable nested object schemas.
 */

import { v } from 'convex/values';
import { currencyAmountSchema } from '@/schema/base';

/**
 * Grouped validators for accounting module
 */
export const accountingValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('pending'),
    v.literal('approved'),
    v.literal('posted'),
    v.literal('reconciled'),
    v.literal('cancelled'),
    v.literal('archived')
  ),

  transactionType: v.union(
    v.literal('journal_entry'),
    v.literal('invoice'),
    v.literal('expense'),
    v.literal('payment'),
    v.literal('transfer'),
    v.literal('adjustment')
  ),

  reconciliationStatus: v.union(
    v.literal('unreconciled'),
    v.literal('partial'),
    v.literal('reconciled'),
    v.literal('disputed')
  ),

  approvalStatus: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('revision_requested')
  ),

  incomingInvoiceStatus: v.union(
    v.literal('expected'),
    v.literal('received'),
    v.literal('approved'),
    v.literal('paid'),
    v.literal('missing'),
    v.literal('disputed'),
    v.literal('cancelled')
  ),

  statementTransactionType: v.union(
    v.literal('invoice'),
    v.literal('payment'),
    v.literal('credit_note'),
    v.literal('adjustment')
  ),

  exportFormat: v.union(v.literal('pdf'), v.literal('excel')),

  invoiceAutoGenStatus: v.union(
    v.literal('generated'),
    v.literal('notification_sent'),
    v.literal('notification_failed')
  ),
} as const;

/**
 * Complex object schemas for accounting module
 */
export const accountingFields = {
  attachment: v.object({
    id: v.string(),
    name: v.string(),
    url: v.string(),
    type: v.string(),
  }),

  expectedCashflowItem: v.object({
    date: v.number(),
    amount: currencyAmountSchema,
    description: v.string(),
  }),

  statementTransaction: v.object({
    date: v.number(),
    type: accountingValidators.statementTransactionType,
    reference: v.string(),
    description: v.string(),
    debit: v.optional(currencyAmountSchema),
    credit: v.optional(currencyAmountSchema),
    balance: currencyAmountSchema,
  }),

  outstandingInvoice: v.object({
    invoiceId: v.id('yourobcInvoices'),
    invoiceNumber: v.string(),
    issueDate: v.number(),
    dueDate: v.number(),
    amount: currencyAmountSchema,
    daysOverdue: v.number(),
  }),
} as const;
