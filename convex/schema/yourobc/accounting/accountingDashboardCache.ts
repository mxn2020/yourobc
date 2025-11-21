// convex/schema/yourobc/accounting/accountingDashboardCache.ts
/**
 * Accounting Dashboard Cache Table
 *
 * Pre-calculated metrics for accounting dashboard performance.
 * Daily cache of receivables, payables, cash flow forecasts, dunning status,
 * and pending approvals. Cache invalidates daily.
 *
 * @module convex/schema/yourobc/accounting/accountingDashboardCache
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import {
  currencyAmountSchema,
  auditFields,
  softDeleteFields,
} from './validators'

/**
 * Accounting Dashboard Cache Table
 * Pre-calculated metrics for dashboard performance (invalidates daily)
 */
export const accountingDashboardCacheTable = defineTable({
  // Identity fields
  publicId: v.string(), // Unique public identifier (e.g., "ADC-2025-11-20")
  ownerId: v.string(), // Organization owner

  // Period
  date: v.number(), // Date this cache is for (daily)

  // Receivables (money owed to us)
  totalReceivables: currencyAmountSchema,
  currentReceivables: currencyAmountSchema, // Not overdue
  overdueReceivables: currencyAmountSchema,
  overdueBreakdown: v.object({
    overdue1to30: currencyAmountSchema,
    overdue31to60: currencyAmountSchema,
    overdue61to90: currencyAmountSchema,
    overdue90plus: currencyAmountSchema,
  }),

  // Payables (money we owe)
  totalPayables: currencyAmountSchema,
  currentPayables: currencyAmountSchema,
  overduePayables: currencyAmountSchema,

  // Cash flow forecast (next 30 days)
  expectedIncoming: v.array(v.object({
    date: v.number(),
    amount: currencyAmountSchema,
    description: v.string(),
  })),
  expectedOutgoing: v.array(v.object({
    date: v.number(),
    amount: currencyAmountSchema,
    description: v.string(),
  })),

  // Dunning status
  dunningLevel1Count: v.number(),
  dunningLevel2Count: v.number(),
  dunningLevel3Count: v.number(),
  suspendedCustomersCount: v.number(),

  // Missing invoices
  missingInvoicesCount: v.number(),
  missingInvoicesValue: currencyAmountSchema,

  // Pending approvals
  pendingApprovalCount: v.number(),
  pendingApprovalValue: currencyAmountSchema,

  // Cache control
  calculatedAt: v.number(),
  validUntil: v.number(), // Cache expiry

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_publicId', ['publicId'])
  .index('by_ownerId', ['ownerId'])
  .index('by_date', ['date'])
  .index('by_ownerId_date', ['ownerId', 'date'])
  .index('by_created', ['createdAt'])
